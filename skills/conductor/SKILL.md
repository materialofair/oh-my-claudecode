---
name: conductor
description: Structured Context -> Spec & Plan -> Implement workflow
---

<Purpose>
Conductor provides a structured workflow for complex feature development through explicit phases: context gathering, specification creation, planning, and implementation. It emphasizes deliberate tracking of requirements and constraints before execution, making it ideal for large features where clarity and documentation are crucial.
</Purpose>

<Use_When>
- User wants a structured, tracked workflow with explicit spec and plan phases
- User says "conductor", "structured workflow", "track this", "conductor setup"
- Task requires careful context gathering before implementation
- User wants to build up requirements incrementally before executing
- Project needs clear documentation of what's being built and why
</Use_When>

<Do_Not_Use_When>
- User wants immediate autonomous execution -- use `autopilot` instead
- User wants hands-off execution without tracking phases -- use `ultrapilot` or `swarm`
- Task is a quick fix or single-file change -- use direct executor delegation
- User wants to explore options or brainstorm -- use `plan` skill instead
- User wants self-correcting execution loops -- use `ralph` instead
</Do_Not_Use_When>

<Why_This_Exists>
Many complex features benefit from a deliberate, phased approach where context is gathered first, then a spec is created, then a plan is reviewed, and finally implementation begins. Conductor makes this workflow explicit and trackable, with clear subcommands for each phase and the ability to review, revert, or adjust at each step.
</Why_This_Exists>

<Execution_Policy>
- All context, specs, and plans are stored in `.omc/conductor/` directory
- Each phase must be explicitly transitioned using subcommands
- Users can review outputs at each phase before proceeding
- Revert is available to go back to previous phases if needed
- Implementation phase runs with full verification and QA checks
</Execution_Policy>

<Steps>
1. **Setup Phase**: Initialize conductor state and directory structure
   - Subcommand: `setup` or `init`
   - Creates `.omc/conductor/` directory
   - Initializes `conductor-state.json` with `phase: "context"`
   - Output: State file confirming setup

2. **Context Gathering Phase**: Collect requirements, constraints, and domain knowledge
   - Subcommand: `track <context>`
   - User provides context incrementally using `track` subcommand
   - Each track call appends to `.omc/conductor/context.md`
   - Context includes: requirements, constraints, domain terms, dependencies, non-functional requirements
   - Output: Updated context file

3. **Specification Phase**: Generate structured specification from gathered context
   - Subcommand: `spec` or auto-transition when ready
   - Analyst (Opus): Extract and structure requirements from context
   - Architect (Opus): Define technical approach, components, and interfaces
   - Output: `.omc/conductor/spec.md`
   - State transition: `phase: "context"` -> `phase: "spec"`

4. **Planning Phase**: Create detailed implementation plan from specification
   - Subcommand: `plan` or auto-transition
   - Planner (Opus): Break down spec into implementation tasks
   - Architect (Opus): Validate plan against constraints
   - Output: `.omc/conductor/plan.md`
   - State transition: `phase: "spec"` -> `phase: "plan"`

5. **Review Phase**: User reviews plan before implementation
   - Subcommand: `review`
   - Display plan content for user review
   - User can approve, request changes, or revert
   - Provides checkpoint before execution

6. **Implementation Phase**: Execute the plan with verification
   - Subcommand: `implement`
   - Executor agents (Haiku/Sonnet/Opus) based on task complexity
   - Includes test execution and verification
   - State transition: `phase: "plan"` -> `phase: "implement"`

7. **Status Check**: View current phase and progress
   - Subcommand: `status`
   - Shows current phase, files created, and next steps
   - No state changes

8. **Revert**: Go back to previous phase
   - Subcommand: `revert`
   - Moves back one phase in the workflow
   - Preserves existing outputs for reference
</Steps>

<Tool_Usage>
- Use `state_write` and `state_read` with mode `'conductor'` for phase tracking
- Store all outputs in `.omc/conductor/` directory (context.md, spec.md, plan.md)
- Delegate to specialist agents: `analyst`, `architect`, `planner`, `executor`
- Use model routing: `opus` for spec/plan phases, `sonnet/haiku` for implementation
- Optional: Use `ask_codex` for validation if MCP is configured
</Tool_Usage>

<Subcommand_Routing>
Conductor uses subcommand-based routing for all operations:

- `setup` | `init` -> Initialize conductor state and directories
- `track <context>` -> Add context to context.md
- `spec` -> Generate specification from context (transition: context -> spec)
- `plan` -> Generate implementation plan (transition: spec -> plan)
- `review` -> Display plan for user review
- `implement` -> Execute the plan (transition: plan -> implement)
- `status` -> Show current phase and progress
- `revert` -> Go back to previous phase

Each subcommand validates the current phase and ensures proper sequencing.
</Subcommand_Routing>

<Examples>
<Good>
User: "conductor setup"
Why good: Explicit initialization of conductor workflow. Sets up state and directory structure.
</Good>

<Good>
User: "conductor track: API needs to support real-time updates via WebSocket"
Why good: Incremental context addition. User builds up requirements before spec generation.
</Good>

<Good>
User: "conductor structured workflow for building a multi-tenant authentication system"
Why good: Clear indication of wanting structured approach for a complex feature.
</Good>

<Bad>
User: "conductor fix the login bug"
Why bad: Single bug fix doesn't benefit from multi-phase workflow. Use direct executor or ralph instead.
</Bad>

<Bad>
User: "conductor build me a TODO app"
Why bad: While conductor could handle this, "build me" pattern is better suited for autopilot's autonomous execution.
</Bad>
</Examples>

<State_Schema>
Conductor state stored in `.omc/state/conductor/conductor-state.json`:

```json
{
  "active": true,
  "phase": "context" | "spec" | "plan" | "implement" | "complete",
  "startedAt": "ISO timestamp",
  "context_file": ".omc/conductor/context.md",
  "spec_file": ".omc/conductor/spec.md",
  "plan_file": ".omc/conductor/plan.md",
  "implementation_started": false,
  "last_subcommand": "string",
  "session_id": "optional session ID"
}
```
</State_Schema>

<Final_Checklist>
- [ ] Setup completed with state file and directories created
- [ ] Context gathered and documented in context.md
- [ ] Specification generated from context and reviewed
- [ ] Implementation plan created and approved
- [ ] Implementation executed with tests passing
- [ ] All outputs preserved in `.omc/conductor/` for reference
- [ ] State file shows `phase: "complete"`
</Final_Checklist>

<Advanced>
## Phase Transitions

Conductor enforces explicit phase ordering:
- `context` -> `spec` (via `spec` subcommand)
- `spec` -> `plan` (via `plan` subcommand)
- `plan` -> `implement` (via `implement` subcommand)
- `implement` -> `complete` (automatic on success)

Use `revert` to go backwards if needed.

## Resume Support

If conductor is interrupted, invoke the skill again with the same working directory. Conductor will detect existing state and resume from the last completed phase.

## Integration with Other Modes

Conductor is non-exclusive and can run alongside other modes like `ralph`, `ultrawork`, or `ecomode`. It provides the workflow structure while other modes can be used during the implementation phase.

## Best Practices

1. **Gather context thoroughly**: Use multiple `track` calls to build comprehensive context before generating spec
2. **Review before implementing**: Always review the plan using `review` subcommand before running `implement`
3. **Incremental refinement**: Use `revert` if spec or plan needs adjustment based on new information
4. **Document constraints**: Include technical constraints, dependencies, and non-functional requirements in context

## Troubleshooting

**Stuck in a phase?** Use `conductor status` to see current phase and next available subcommands.

**Need to change the spec?** Use `conductor revert` to go back to context phase, add more context with `track`, then regenerate spec.

**Implementation failing?** Review `.omc/conductor/plan.md` for potential issues. Consider reverting to plan phase to refine the approach.
</Advanced>
