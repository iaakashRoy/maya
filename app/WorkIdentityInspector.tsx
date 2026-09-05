"use client";

import type { ExpertAgent, ProjectMembership, WorkspaceCollaborator, WorkspaceProject } from "./workspace-model";
import type { ProjectAppRun, ProjectWorkSession, SessionActivity } from "./project-activity-model";

export type WorkIdentitySelection = { kind: "agent" | "member"; id: string } | null;
export type WorkIdentityMember = { membership: ProjectMembership; collaborator: WorkspaceCollaborator };

type WorkIdentityInspectorProps = {
  project: WorkspaceProject;
  selection: WorkIdentitySelection;
  agents: readonly ExpertAgent[];
  members: readonly WorkIdentityMember[];
  sessions: readonly ProjectWorkSession[];
  activities: readonly SessionActivity[];
  appRuns: readonly ProjectAppRun[];
  onClose: () => void;
  onOpenSession: (sessionId: string) => void;
  onOpenRun: (sessionId: string, runId: string) => void;
  onReceipt: (title: string, detail: string, artifact: string) => void;
};

const initialsFor = (name: string) => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

export default function WorkIdentityInspector({ project, selection, agents, members, sessions, activities, appRuns, onClose, onOpenSession, onOpenRun, onReceipt }: WorkIdentityInspectorProps) {
  if (!selection) return null;
  const isAgent = selection.kind === "agent";
  const agent = isAgent ? agents.find((item) => item.id === selection.id) : undefined;
  const member = !isAgent ? members.find((item) => item.collaborator.id === selection.id) : undefined;
  if ((isAgent && !agent) || (!isAgent && !member)) return null;

  const personName = agent?.name ?? member!.collaborator.name;
  const directlyAttributedActivities = activities.filter((activity) => activity.actor === personName || (agent && activity.actor === agent.id));
  const attributedSessionIds = new Set([
    ...directlyAttributedActivities.map((activity) => activity.sessionId),
    ...(agent ? sessions.filter((session) => session.leadAgentId === agent.id || session.participantAgentIds.includes(agent.id)).map((session) => session.id) : []),
  ]);
  const relatedSessions = sessions.filter((session) => attributedSessionIds.has(session.id));
  const involvedRuns = appRuns.filter((run) => attributedSessionIds.has(run.sessionId));
  const relatedActivities = directlyAttributedActivities.slice(-8).reverse();

  return <aside className="work-identity-inspector" aria-label={`${isAgent ? "Agent" : "Team member"} accountability record for ${personName}`}>
    <header>
      <div><span>{isAgent ? "AGENT ACCOUNTABILITY" : "TEAM ACCOUNTABILITY"}</span><h2>{personName}</h2><p>{project.code} · {project.name}</p></div>
      <button data-action-id="identity.close" type="button" aria-label="Close accountability inspector" onClick={onClose}>×</button>
    </header>
    <div className="identity-detail">
      {agent ? <>
        <section className="identity-summary"><span>{initialsFor(agent.name)}</span><div><small>{agent.level} · {agent.state}</small><h3>{agent.role}</h3><p>{agent.authority}</p></div></section>
        <dl className="identity-metrics"><div><dt>Evaluated runs</dt><dd>{agent.evaluatedRuns}</dd></div><div><dt>Approved</dt><dd>{agent.approvedRuns}</dd></div><div><dt>Calibration</dt><dd>{agent.calibration}%</dd></div><div><dt>Failure rate</dt><dd>{agent.failureRate}%</dd></div></dl>
        <section className="identity-contract"><h3>Capability manifest</h3><p><b>Skills</b>{agent.skills.join(" · ")}</p><p><b>Connections</b>{agent.mcps.join(" · ")}</p><p><b>Tools</b>{agent.tools.join(" · ")}</p><button data-action-id={`identity.agent.receipt.${agent.id}`} type="button" onClick={() => onReceipt("Agent profile receipt opened", `${agent.name} has ${agent.evaluatedRuns} synthetic evaluated runs, ${agent.approvedRuns} approved fixtures, and authority '${agent.authority}'.`, `AGENT-${project.code}-${agent.id.toUpperCase()}`)}>Open profile receipt</button></section>
      </> : <>
        <section className="identity-summary"><span>{member!.collaborator.initials}</span><div><small>{member!.collaborator.affiliation} · {member!.collaborator.organization}</small><h3>{member!.collaborator.role}</h3><p>{member!.membership.projectRole}</p></div></section>
        <dl className="identity-metrics"><div><dt>Project role</dt><dd>{member!.membership.projectRole}</dd></div><div><dt>Granted actions</dt><dd>{member!.membership.capabilities.length}</dd></div><div><dt>Identity source</dt><dd>{member!.collaborator.profileOrigin}</dd></div><div><dt>Membership</dt><dd>{member!.membership.origin}</dd></div></dl>
        <section className="identity-contract"><h3>Declared project rights</h3><p>{member!.membership.capabilities.join(" · ")}</p><button data-action-id={`identity.member.receipt.${member!.collaborator.id}`} type="button" onClick={() => onReceipt("Member accountability receipt opened", `${member!.collaborator.name} is ${member!.membership.projectRole} with ${member!.membership.capabilities.length} declared project capabilities.`, member!.membership.id)}>Open membership receipt</button></section>
      </>}

      <section className="identity-worklog">
        <header><div><small>PROJECT LEDGER</small><h3>Work and involvement</h3></div><span>{relatedActivities.length} exact events · {relatedSessions.length} sessions</span></header>
        {relatedActivities.length > 0 && <h4>Exactly attributed events</h4>}
        {relatedActivities.slice(0, 4).map((activity) => <button data-action-id={`identity.activity.${activity.id}`} type="button" key={activity.id} onClick={() => onReceipt("Attributed activity opened", `${activity.actor} · ${activity.title} · ${activity.detail}`, activity.id)}><i>{String(activity.sequence).padStart(2, "0")}</i><span><b>{activity.title}</b><small>{activity.actor} · {activity.state}</small></span><em>Trace</em></button>)}
        {relatedSessions.length > 0 && <h4>Involved sessions</h4>}
        {relatedSessions.slice(0, 4).map((session) => <button data-action-id={`identity.session.${session.id}`} type="button" key={session.id} onClick={() => onOpenSession(session.id)}><i>SES</i><span><b>{session.title}</b><small>{session.id} · lead or participant</small></span><em>Open</em></button>)}
        {involvedRuns.length > 0 && <h4>Runs in involved sessions</h4>}
        {involvedRuns.slice(0, 4).map((run) => <button data-action-id={`identity.run.${run.id}`} type="button" key={run.id} onClick={() => onOpenRun(run.sessionId, run.id)}><i>RUN</i><span><b>{run.title}</b><small>{run.id} · session context, not ownership</small></span><em>Open</em></button>)}
        {!relatedSessions.length && !involvedRuns.length && !relatedActivities.length && <p className="identity-empty">No exact activity or session involvement is recorded for this identity in the current fixture.</p>}
      </section>
      <small className="identity-boundary">Synthetic accountability view. Only named actor events are attributed; session participation and runs are shown as involvement, not ownership. Production attribution requires authenticated identity, signed events, durable timestamps, and immutable audit storage.</small>
    </div>
  </aside>;
}
