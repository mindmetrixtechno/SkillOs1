# Workbook conversion runner

This Site remains owner-private. On each unattended run:

1. Read the current Site with Sites get_site. Confirm owner-only access and retrieve its current service-access credential. Do not store or print the credential.
2. POST `{}` to the Site's `/api/runner/tick`, sending the credential only to this same Site in `OAI-Sites-Authorization: Bearer …`. Use a supported server HTTP client. Pass credentials through hidden stdin or an in-memory parameter, never shell arguments or files.
3. The returned JSON is authoritative. Stop for idle, blocked, busy, waiting, or error. Missing `GEMINI_API_KEY` is a setup block, not a request to create or buy credentials. Do not translate manually, publish drafts, change model settings, or alter sharing.
4. If `processed`, `ready`, `extracted` or `stale` is returned, repeat from step 2 for up to 100 checkpoints or 20 minutes, whichever comes first. Each endpoint call is bounded and persists progress. Do not use browser automation.
5. Summarize completed or blocked work without workbook content, credentials or student data. If no work was pending, produce no unnecessary user message. Do not redeploy.

Source and writer authorization are independent. Current source commit can be retrieved through Sites source repository access. Successful private service access is required before this schedule is considered verified.
