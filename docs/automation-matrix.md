# Automation Matrix

| Task | Automation Level | Requires Approval (Y/N) | Systems Touched | Notes |
| --- | --- | --- | --- | --- |
| Password reset | Full-Auto | N | Identity System, Policy Engine | Identity system + policy check. |
| Unlock user account | Full-Auto | N | Identity System | Account unlock through identity tooling. |
| Create employee account | Assisted | N | HRIS, Identity System | HR onboarding trigger starts provisioning workflow. |
| Manage access permissions | Assisted | Y | Identity System, Security Controls | Needs manager/security approval. |
| Laptop setup | Assisted | N | MDM, Software Deployment | Software deployment can be automated; physical unboxing needs a human. |
| Install Windows/macOS | Assisted | N | MDM, Endpoint Provisioning | Trigger through device management, not physical installation. |
| Troubleshoot slow PC | Assisted | N | Endpoint Diagnostics | Run diagnostics and suggest fixes. |
| Hardware repair | Human-Required | N | Field Service | Physical repair requires a human technician. |
| Install software | Assisted | Y | Software Catalog, MDM, Endpoint Management | Via device management tools with approval gating. |
| Update software | Full-Auto | N | Patch Management, Endpoint Management | Fully automated update cycle. |
| Outlook/email issues | Full-Auto | N | Email Platform, Client Configuration | Diagnose and fix common cases automatically. |
| VPN issues | Full-Auto | N | VPN Gateway, Endpoint Network Stack | Diagnose and apply common fixes. |
| Wi-Fi troubleshooting | Assisted | N | Wireless Controller, Endpoint Network Stack | Guide users and run diagnostics. |
| Printer issues | Assisted | N | Print Server, Endpoint Driver Store | Configuration is automatable; hardware issues need a human. |
| Ticket creation | Full-Auto | N | ITSM | Full-auto with AI categorization and urgency assignment. |
| Ticket resolution | Assisted | N | ITSM, Knowledge Base | Repetitive requests can be automated. |
| Ticket escalation | Full-Auto | N | ITSM, Routing Rules | AI routes to the right team. |
| Phone/chat/email support | Assisted | N | Omnichannel Platform, Knowledge Base | AI chat/voice can answer many requests before handoff. |
| Remote support | Assisted | Y | Remote Support Tooling, Endpoint Management | AI can initiate approved remote tools; complex sessions need a human. |
