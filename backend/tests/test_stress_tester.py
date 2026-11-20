import pytest
from app.services.stress_tester import stress_tester_service
from app.models.schemas import PatchPolicyRequest

def test_adversarial_stress_test_identifies_loopholes():
    report = stress_tester_service.run_stress_test("inkloom")
    assert report.total_scenarios_tested >= 5
    assert report.loopholes_discovered >= 1
    assert 0 <= report.resilience_score <= 100
    
    # Verify scenarios contain attack vector explanations
    for s in report.scenarios:
        assert s.synthetic_attack_copy
        assert s.intended_adversarial_vector
        assert s.status in ["evaded_loophole", "intercepted"]

def test_policy_patch_boosts_resilience():
    # Identify an evasion scenario
    report1 = stress_tester_service.run_stress_test("inkloom")
    evaded = [s for s in report1.scenarios if s.status == "evaded_loophole"]
    assert len(evaded) > 0
    target_scenario = evaded[0]
    
    # Apply patch recommended for that scenario
    req = PatchPolicyRequest(
        brand_id="inkloom",
        scenario_id=target_scenario.scenario_id,
        patch_type="add_forbidden_term",
        forbidden_terms=target_scenario.recommended_patch_rule.get("prohibited_terms", []),
        preferred_terms=target_scenario.recommended_patch_rule.get("preferred_terms", {})
    )
    patched_brand = stress_tester_service.apply_policy_patch(req)
    assert patched_brand is not None
    
    # Re-run simulation
    report2 = stress_tester_service.run_stress_test("inkloom")
    # Verify scenario is now intercepted
    updated_scenario = next(s for s in report2.scenarios if s.scenario_id == target_scenario.scenario_id)
    assert updated_scenario.status == "intercepted"
    assert report2.resilience_score >= report1.resilience_score
