import random

# Base cost ranges by project type (low, high) in USD
BASE_COSTS = {
    "Bathroom": {"labor": (3000, 12000), "material": (2000, 13000)},
    "Shower": {"labor": (2000, 8000), "material": (1000, 7000)},
    "Kitchen": {"labor": (5000, 25000), "material": (5000, 25000)},
    "Pool Deck": {"labor": (3000, 15000), "material": (2000, 15000)},
    "Patio": {"labor": (2000, 10000), "material": (1000, 10000)},
}

# Regional cost multipliers based on ZIP code prefix
REGIONAL_MULTIPLIERS = {
    "100": 1.4, "101": 1.4, "102": 1.3,  # NYC area
    "900": 1.35, "901": 1.35, "902": 1.3,  # LA area
    "941": 1.5, "940": 1.45,  # SF Bay Area
    "331": 1.15, "330": 1.1,  # Miami
    "606": 1.2, "600": 1.15,  # Chicago
    "752": 1.05, "750": 1.0,  # Dallas
    "303": 1.1,  # Atlanta
    "981": 1.25,  # Seattle
    "021": 1.3,  # Boston
    "200": 1.25,  # DC
    "701": 1.1, "700": 1.05,  # New Orleans
}


def get_regional_multiplier(zip_code: str) -> float:
    prefix3 = zip_code[:3]
    if prefix3 in REGIONAL_MULTIPLIERS:
        return REGIONAL_MULTIPLIERS[prefix3]
    prefix2 = zip_code[:2]
    for key, val in REGIONAL_MULTIPLIERS.items():
        if key[:2] == prefix2:
            return val * 0.95
    return 1.0


def estimate_cost(project_type: str, zip_code: str) -> dict:
    if project_type not in BASE_COSTS:
        project_type = "Bathroom"

    base = BASE_COSTS[project_type]
    multiplier = get_regional_multiplier(zip_code)

    # Add slight randomness for realism
    variance = random.uniform(0.9, 1.1)

    labor_low = int(base["labor"][0] * multiplier * variance)
    labor_high = int(base["labor"][1] * multiplier * variance)
    material_low = int(base["material"][0] * multiplier * variance)
    material_high = int(base["material"][1] * multiplier * variance)

    return {
        "labor_low": labor_low,
        "labor_high": labor_high,
        "material_low": material_low,
        "material_high": material_high,
        "total_low": labor_low + material_low,
        "total_high": labor_high + material_high,
        "zip_code": zip_code,
        "project_type": project_type,
        "regional_multiplier": round(multiplier, 2),
    }
