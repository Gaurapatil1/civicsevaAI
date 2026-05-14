# CivicSevaAI — Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** May 2026  
**Status:** Draft  
**Owner:** CivicSevaAI Product Team  

---

## 1. Executive Summary

CivicSevaAI is an AI-powered municipal complaint management platform designed to help government offices operating under severe staff shortages intelligently prioritize, route, and resolve citizen grievances. By combining machine learning with smart workforce allocation, the platform reduces complaint resolution time, improves citizen satisfaction, and brings operational transparency to urban local bodies.

---

## 2. Problem Statement

Municipal corporations across India face a systemic challenge: citizen complaints far outnumber available staff. Key pain points include:

- **No intelligent triage** — complaints are handled on a first-come, first-served basis regardless of urgency.
- **Manual assignment** — supervisors waste time manually routing complaints to workers.
- **No visibility** — citizens have no feedback loop; admins lack a real-time overview.
- **Staff inefficiency** — overloaded workers and idle workers coexist due to poor allocation.
- **Delayed resolution** — critical issues like water outages or road accidents wait in the same queue as low-priority requests.

---

## 3. Goals & Success Metrics

### Product Goals

| Goal | Description |
|------|-------------|
| Faster resolution | Reduce average complaint resolution time by 40% |
| Smart prioritization | Ensure Critical complaints are addressed within 2 hours |
| Higher throughput | Enable the same number of workers to handle 30% more complaints |
| Citizen trust | Provide real-time status updates to complainants |
| Admin visibility | Give supervisors a single pane of glass for all complaints and workers |

### Key Metrics (KPIs)

| Metric | Target |
|--------|--------|
| Complaint resolution rate | > 80% within SLA |
| AI categorization accuracy | > 90% |
| Critical complaint response time | < 2 hours |
| Worker utilization rate | > 75% |
| Citizen satisfaction score | > 4.0 / 5.0 |

---

## 4. Target Users

### 4.1 Citizens
Residents of a municipality who need to report civic issues such as broken roads, water supply failures, drainage overflow, or street light outages.

**Needs:**
- Simple, familiar complaint submission (WhatsApp-style)
- Confirmation that their complaint was received and assigned
- Status updates on resolution

### 4.2 Municipal Administrators
Supervisors and officers managing the complaint resolution workflow.

**Needs:**
- Real-time dashboard showing all complaints, priorities, and worker assignments
- AI-predicted category and priority to reduce manual triage effort
- Worker availability and workload visibility
- SLA breach alerts

---

## 5. User Stories

### Citizen Stories

- As a citizen, I want to submit a complaint in plain language so that I don't need to fill complex forms.
- As a citizen, I want to receive instant confirmation with a reference number so I know my complaint was logged.
- As a citizen, I want to know which department and worker has been assigned so I have a point of contact.

### Admin Stories

- As an admin, I want the AI to automatically categorize and prioritize complaints so I can focus on oversight.
- As an admin, I want to see which workers are available and their current task load so I can intervene if needed.
- As an admin, I want to view complaints filtered by status, priority, and category so I can manage SLA compliance.
- As an admin, I want analytics on complaint trends so I can plan resource deployment.

---

## 6. Features & Scope

### 6.1 In Scope (v1.0)

| Feature | Description | Priority |
|---------|-------------|----------|
| WhatsApp-style complaint UI | Mobile-friendly chat interface for complaint submission | P0 |
| AI complaint categorization | ML model classifying complaints into 7 departments | P0 |
| AI priority prediction | 4-level urgency detection (Low / Medium / High / Critical) | P0 |
| Smart worker allocation | Score-based automatic assignment to best available worker | P0 |
| Admin dashboard | Real-time view of complaints, workers, and analytics | P0 |
| Worker roster | Availability, active tasks, and department visibility | P1 |
| Complaint status tracking | Open / In Progress / Resolved lifecycle | P1 |
| JWT authentication | Secure admin login | P1 |
| Chart analytics | Category breakdown and priority distribution charts | P2 |

### 6.2 Out of Scope (v1.0)

- Real WhatsApp Business API integration
- Multi-city / multi-tenant SaaS support
- Multilingual complaint submission
- Live GIS / map-based tracking
- Native mobile apps (iOS / Android)
- SMS / email notifications to citizens

---

## 7. Complaint Categories

The AI model predicts complaints into the following 7 departments:

1. Water
2. Roads
3. Drainage
4. Electrical
5. Traffic
6. Sanitation
7. Public Safety

---

## 8. Priority Levels & SLA

| Priority | Description | Target Resolution |
|----------|-------------|-------------------|
| Critical | Life-affecting — no water, flooding, safety hazard | 2 hours |
| High | Significant disruption — major pothole, power outage | 8 hours |
| Medium | Moderate inconvenience — streetlight, partial supply | 24 hours |
| Low | Minor issue — cosmetic, non-urgent requests | 72 hours |

---

## 9. Smart Allocation Logic

Workers are scored using the following formula before assignment:

```
score = (active_tasks × 0.5) + (avg_resolution_hours × 0.3)
```

The worker with the **lowest score** in the matching department who is **available** receives the assignment. This ensures workload is balanced and faster workers are preferred.

---

## 10. Technical Constraints

| Constraint | Detail |
|------------|--------|
| Hackathon timeline | MVP must be buildable within 48–72 hours |
| Lightweight ML | No GPU required; Scikit-learn + TF-IDF on CPU |
| No real WhatsApp API | Simulated WhatsApp chat UI |
| Custom dataset | Synthetic civic complaint dataset required |
| Limited infrastructure | Free-tier hosting (Vercel, Render, MongoDB Atlas) |

---

## 11. Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js, Tailwind CSS, Chart.js, Axios |
| Backend | FastAPI (Python) |
| Authentication | JWT |
| Database | MongoDB Atlas |
| AI/ML | Scikit-learn, TF-IDF, Random Forest |
| Deployment | Frontend → Vercel, Backend → Render |

---

## 12. Future Roadmap

### Phase 2 (3–6 months)
- Real WhatsApp Business API for complaint submission
- SMS/email status notifications to citizens
- Multilingual support (Hindi, Marathi, Tamil, etc.)
- Complaint image/photo upload

### Phase 3 (6–12 months)
- Multi-city SaaS architecture with tenant isolation
- Live GIS map for worker tracking
- Predictive analytics for complaint hotspots
- Citizen mobile app (iOS & Android)

### Phase 4 (12+ months)
- Integration with national e-governance portals
- BI dashboards for municipal leadership
- Automated escalation workflows
- Voice-based complaint submission (IVR)

---

## 13. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Low AI accuracy on edge cases | Medium | High | Fallback to manual categorization by admin |
| Worker data not updated in real time | Medium | Medium | Periodic sync + manual override option |
| No internet access for citizens | Low | High | Future SMS-based fallback |
| Dataset bias in training data | Medium | High | Diversify synthetic dataset across regions |
| Single point of failure (Render free tier) | Low | High | Document manual escalation procedure |

---

## 14. Approval & Sign-off

| Role | Name | Date |
|------|------|------|
| Product Owner | — | — |
| Tech Lead | — | — |
| Design Lead | — | — |
| Stakeholder | Municipal Corporation | — |

---

*Document prepared for CivicSevaAI v1.0 — Hackathon Edition*