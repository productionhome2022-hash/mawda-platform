# Analysis and evidence classification

## A. Ubuntu command history
See raw/shell-history-relevant.txt.

This may reveal commands previously issued, but shell history is not proof
that every command completed successfully.

## B. Existing execution logs
See raw/local-log-file-list.txt and raw/local-logs/.

File modification timestamps are not necessarily test execution timestamps.

## C. Existing repository reports
See raw/repository-audit-files.txt and raw/repository-audit-content/.

## D. Git history
See raw/environment-and-git.txt.

## E. GitHub Actions
See raw/workflow-44183645018.json and its jobs file.
The workflow run must be classified by its original timestamp and timezone.

## F. Four integration stages
The owner reports that four stages passed.
Their exact boundaries and acceptance evidence must be recovered from original
commands, logs, commits, and workflow runs. Do not invent missing stage results.

## G. Limitations
Ubuntu shell history may be incomplete, may have been cleared, or may not yet
have been flushed. Temporary logs may have been removed.
Absence of a local record does not prove an event did not happen.

## H. Separation of dates
Do not mix the 21 November replay attempt with historical results from
17 and 18 November.
