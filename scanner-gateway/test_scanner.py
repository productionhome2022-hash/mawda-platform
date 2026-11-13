import json
import os
import tempfile
import unittest
from PIL import Image
from unittest.mock import patch, MagicMock

import app


class ScannerGatewayTests(unittest.TestCase):
    def setUp(self):
        self.payload = {
            "mediaId": "123e4567-e89b-12d3-a456-426614174000",
            "objectPath": "quarantine/member-1/123e4567-e89b-12d3-a456-426614174000",
            "objectGeneration": "987654321",
            "downloadUrl": "https://storage.googleapis.com/example-bucket/object?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Signature=abc",
            "callbackUrl": "https://us-central1-example.cloudfunctions.net/receiveMediaScanVerdict",
            "provider": app.PROVIDER,
        }

    def test_dispatch_requires_https_gcs_and_cloud_functions_callback(self):
        self.assertEqual(app.validate_dispatch(self.payload)[0], self.payload["mediaId"])
        bad = dict(self.payload, downloadUrl="https://evil.example/file?X-Goog-Algorithm=a&X-Goog-Signature=b")
        with self.assertRaises(ValueError):
            app.validate_dispatch(bad)
        bad = dict(self.payload, downloadUrl="https://storage.googleapis.com/bucket/object?unsigned=1")
        with self.assertRaises(ValueError):
            app.validate_dispatch(bad)
        bad = dict(self.payload, callbackUrl="https://evil.example/callback")
        with self.assertRaises(ValueError):
            app.validate_dispatch(bad)
        bad = dict(self.payload, objectPath="quarantine/../public/file")
        with self.assertRaises(ValueError):
            app.validate_dispatch(bad)

    def test_dispatch_rejects_invalid_identity_generation_and_provider(self):
        for key, value in [
            ("mediaId", "not-a-uuid"),
            ("objectGeneration", "latest"),
            ("provider", "untrusted"),
        ]:
            bad = dict(self.payload, **{key: value})
            with self.subTest(key=key), self.assertRaises(ValueError):
                app.validate_dispatch(bad)

    def test_api_token_comparison_fails_closed(self):
        self.assertTrue(app.constant_time_token_match("Bearer " + "x" * 40, "Bearer " + "x" * 40))
        self.assertFalse(app.constant_time_token_match("Bearer wrong", "Bearer " + "x" * 40))
        self.assertFalse(app.constant_time_token_match("", "Bearer " + "x" * 40))

    @patch("app.subprocess.run")
    def test_clamav_clean_and_malicious_exit_codes_are_distinguished(self, run):
        run.return_value = MagicMock(returncode=0, stdout="/tmp/file: OK", stderr="")
        self.assertEqual(app.scan_file("/tmp/file"), "clean")
        run.return_value = MagicMock(returncode=1, stdout="/tmp/file: Eicar-Test-Signature FOUND", stderr="")
        self.assertEqual(app.scan_file("/tmp/file"), "malicious")
        run.return_value = MagicMock(returncode=2, stdout="", stderr="daemon unavailable")
        with self.assertRaises(RuntimeError):
            app.scan_file("/tmp/file")

    def test_signed_capability_redirects_are_rejected(self):
        handler = app.RejectRedirect()
        with self.assertRaises(ValueError):
            handler.redirect_request(None, None, 302, "Found", {}, "https://evil.example/collect")

    def test_safe_preview_reencodes_static_rasters_as_metadata_free_webp(self):
        with tempfile.NamedTemporaryFile(suffix=".png") as source:
            image = Image.new("RGB", (12, 8), (180, 30, 60))
            image.save(source.name, format="PNG")
            preview = app.make_safe_webp_preview(source.name)
        self.assertIsNotNone(preview)
        self.assertTrue(preview.startswith(b"RIFF"))
        self.assertEqual(preview[8:12], b"WEBP")
        with tempfile.NamedTemporaryFile(suffix=".webp") as output:
            output.write(preview)
            output.flush()
            with Image.open(output.name) as decoded:
                self.assertEqual(decoded.format, "WEBP")
                self.assertEqual(decoded.size, (12, 8))
                self.assertEqual(len(decoded.getexif()), 0)

    def test_safe_preview_rejects_animated_and_oversized_rasters(self):
        with tempfile.NamedTemporaryFile(suffix=".gif") as source:
            first = Image.new("RGB", (4, 4), "red")
            second = Image.new("RGB", (4, 4), "blue")
            first.save(source.name, save_all=True, append_images=[second], format="GIF")
            self.assertIsNone(app.make_safe_webp_preview(source.name))
        with tempfile.NamedTemporaryFile(suffix=".png") as source:
            image = Image.new("RGB", (10001, 1), "black")
            image.save(source.name, format="PNG")
            self.assertIsNone(app.make_safe_webp_preview(source.name))

    def test_gateway_never_exposes_scanner_output_in_public_errors(self):
        self.assertLessEqual(app.MAX_CONTROL_BODY, 64 * 1024)
        self.assertLessEqual(app.MAX_UPLOAD_BYTES, 100 * 1024 * 1024)


if __name__ == "__main__":
    unittest.main()
