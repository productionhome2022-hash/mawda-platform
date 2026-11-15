/// Shared client-side ceiling for live microphone voice messages.
/// The trusted backend and scanner independently enforce the same 60-second limit.
const int maxLiveChatAudioRecordingSeconds = 60;
