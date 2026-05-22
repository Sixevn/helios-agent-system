# Knova Core Packet Template (v1)

Use this once per cycle as the mandatory decision gate artifact.

## Metadata

Cycle ID:

Cycle start date:

Cycle end date:

Checkpoint date:

## 1) Core Boys Evidence Gate

cycle_window:
- start:
- end:

data_gate:
- result: Ready / Hold
- baseline_logs_count:
- completeness: Complete / Incomplete
- srm_status: Pass / Fail / N/A
- guardrail_breaches:
- checklist_all_checked: Yes / No

action_gate:
- result: Keep / Improve / Stop / N/A
- confidence: Low / Medium / High
- reason:
- next_action:
- owner:

one_variable_change_status (for cycle 2+):
- changed_variable:
- all_other_variables_fixed: Yes / No

## 2) Pattern Ops Top 3

top_opportunities:

### Rank 1
- opportunity_id:
- name:
- composite_score:
- risk_exposure_inverse:
- tier1_source_present: Yes / No
- kill_switch_defined: Yes / No
- decision: Execute / Hold / Stop
- reason:
- owner_agent:

### Rank 2
- opportunity_id:
- name:
- composite_score:
- risk_exposure_inverse:
- tier1_source_present: Yes / No
- kill_switch_defined: Yes / No
- decision: Execute / Hold / Stop
- reason:
- owner_agent:

### Rank 3
- opportunity_id:
- name:
- composite_score:
- risk_exposure_inverse:
- tier1_source_present: Yes / No
- kill_switch_defined: Yes / No
- decision: Execute / Hold / Stop
- reason:
- owner_agent:

## 3) Weekly Action Commitments

approved_actions:

### Action 1
- linked_opportunity:
- exact_output:
- owner:
- deadline:
- success_criteria:
- risk_limit:
- kill_switch:

### Action 2
- linked_opportunity:
- exact_output:
- owner:
- deadline:
- success_criteria:
- risk_limit:
- kill_switch:

## 4) Reliability and Stop Rules

reliability_flags:
- tier1_requirement_met_for_executed_items: Yes / No
- experiment_primary_metric_defined: Yes / No
- experiment_guardrails_defined: Yes / No
- srm_checked_before_lift_read: Yes / No
- invalid_experiments_present: Yes / No

stop_rules:
- hold_consecutive_count:
- fail_safe_triggered: Yes / No
- scope_simplification_action:

## 5) Helios Final Decision

helios_final_decision:
- approved_actions:
- deferred_actions:
- escalations:
- final_notes:
