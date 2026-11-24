# Nimbus Cement v1 data and formulas

The Next.js dashboard uses **static, checked-in inputs**. Climate research produced the annual hot-day counts before they were added to the app. A Python script combines those counts with the plant inventory and generates a TypeScript module. Next.js bundles that module, and the report calculates scores, costs and rankings from the bundled records. Loading a dashboard screen makes zero climate API requests.

The Assessment Portfolio contains nine plants. Both comparisons use the same FY2025–26 workforce, production, direct emissions and revenue. The dashboard changes the modelled climate year and the carbon scenario price. [Fixed-portfolio decision](../dashboard/public/docs/adr/0001-hold-assessment-portfolio-fixed.md)

## Source files and the Next.js data flow

| File | Role |
| --- | --- |
| [Plant inventory CSV](../dashboard/public/docs/nimbus_cement_plants.csv) | One row per plant. Provides identity, location, workforce, cement output, clinker produced, direct CO₂ and revenue. |
| [Hot-day counts CSV](../dashboard/public/docs/research/nimbus-hot-days-model-counts.csv) | 63 rows, one per `plant_id` and climate model. Each row carries its grid centre and counts for both years. |
| [Daily temperature and calculation workbook](../dashboard/public/outputs/nimbus-heat-2026-2040/nimbus-hot-days-2026-2040.xlsx) | Research evidence behind the counts, including daily values and exact source files. The dashboard offers it as a download. |
| [Data generator](../dashboard/scripts/build_data.py) | Reads the CSVs, joins on `plant_id`, keeps inventory order and computes the two medians per plant. |
| [Generated plant records](../dashboard/src/features/assessment/plant-records.ts) | Bundles the nine records, both medians, coordinates and all seven model counts per plant. |
| [Report entry point](../dashboard/src/features/assessment/report.ts) and [assessment calculations](../dashboard/src/features/assessment/assessment.ts) | The report calls `buildAssessment(plantRecords)` once at module load. Overview, both comparisons, Conclusions and the evidence drawers share the result. |

The CSVs and workbook are also served as static evidence links from the dashboard. The tables below are a reference for checking the app. Update the source CSVs and regenerate the TypeScript records when the underlying figures change.

## 1. Plant inputs

The app uses `town` as the plant’s display name. The fields for the calculations are `employees`, `cement_output_fy2025_26_mt`, `clinker_produced_fy2025_26_mt`, `scope1_co2_fy2025_26_kt` and `revenue_fy2025_26_inr_cr`. Mt means million tonnes, kt means thousand tonnes and one crore equals 10,000,000 rupees. [Plant inventory CSV](../dashboard/public/docs/nimbus_cement_plants.csv)

| ID | Plant | Employees | Cement (Mt) | Clinker produced (Mt) | Direct CO₂ (kt) | Revenue (₹ crore) |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| P01 | Chittorgarh | 820 | 3.30 | 3.43 | 3,125 | 1,749 |
| P02 | Satna | 760 | 2.85 | 2.05 | 1,720 | 1,511 |
| P03 | Chandrapur | 690 | 2.40 | 1.78 | 1,510 | 1,248 |
| P04 | Nalgonda | 540 | 1.85 | 1.22 | 1,025 | 999 |
| P05 | Ariyalur | 480 | 1.55 | 1.12 | 1,005 | 868 |
| P06 | Baloda Bazar | 700 | 2.55 | 3.01 | 2,470 | 1,275 |
| P07 | Mundra | 210 | 1.60 | 0.00 | 32 | 848 |
| P08 | Paradip | 180 | 1.05 | 0.00 | 21 | 536 |
| P09 | Durgapur | 170 | 1.20 | 0.00 | 24 | 624 |
| | **Portfolio** | **4,550** | **18.35** | **12.61** | **10,932** | **9,658** |

The plant evidence drawer shows the following clinker shipments as context. The heat calculation uses clinker **produced at the plant**, so grinding units have zero clinker production. [Shipment records in the report](../dashboard/src/features/assessment/report.ts)

| Supplier | Recipient | Mt/year |
| --- | --- | ---: |
| P01 Chittorgarh | P07 Mundra | 1.12 |
| P06 Baloda Bazar | P08 Paradip | 0.68 |
| P06 Baloda Bazar | P09 Durgapur | 0.60 |

## 2. Climate research inputs

The research used daily maximum near-surface air temperature (`tasmax`) from NASA NEX-GDDP-CMIP6 v2.0 under SSP2–4.5. It matched each plant to the nearest 0.25° grid centre and counted days with an **unrounded maximum of at least 313.15 K (40°C)** separately for each model and calendar year. Both years are simulations. Each model had 365 daily values in 2026 and 366 in 2040, including 29 February. The two selected years can differ because of year-to-year weather variability as well as the scenario. The counts describe ambient temperature at grid scale. Site exposure also depends on humidity, process heat and workload. [Research and model sources](../dashboard/public/docs/research/nimbus-hot-days-2026-2040.md#source-coverage-and-calculation) · [Daily temperature workbook](../dashboard/public/outputs/nimbus-heat-2026-2040/nimbus-hot-days-2026-2040.xlsx)

### All seven model counts per plant

Each cell shows **2026 → 2040** annual hot days. The column names expand to `ACCESS-CM2`, `CNRM-CM6-1`, `EC-Earth3`, `IPSL-CM6A-LR`, `MIROC6`, `MPI-ESM1-2-HR` and `MRI-ESM2-0`, in order. The grid centre is `(latitude, longitude)` in decimal degrees. [Model-count CSV](../dashboard/public/docs/research/nimbus-hot-days-model-counts.csv)

| Plant | Grid centre | ACCESS | CNRM | EC-Earth | IPSL | MIROC | MPI | MRI |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| P01 | 24.875, 74.625 | 55 → 43 | 31 → 72 | 56 → 34 | 38 → 47 | 20 → 56 | 30 → 33 | 26 → 50 |
| P02 | 24.625, 80.875 | 63 → 57 | 62 → 79 | 75 → 30 | 59 → 69 | 53 → 63 | 55 → 35 | 60 → 79 |
| P03 | 19.875, 79.375 | 87 → 72 | 66 → 76 | 80 → 47 | 83 → 93 | 50 → 67 | 46 → 52 | 66 → 98 |
| P04 | 17.125, 79.375 | 61 → 56 | 48 → 55 | 49 → 11 | 53 → 62 | 43 → 43 | 28 → 34 | 23 → 59 |
| P05 | 11.125, 79.125 | 0 → 1 | 0 → 7 | 6 → 0 | 0 → 5 | 0 → 0 | 0 → 3 | 0 → 5 |
| P06 | 21.625, 82.125 | 72 → 63 | 59 → 68 | 64 → 30 | 72 → 71 | 51 → 64 | 47 → 40 | 53 → 95 |
| P07 | 22.875, 69.625 | 26 → 10 | 6 → 14 | 4 → 9 | 3 → 2 | 4 → 6 | 5 → 7 | 0 → 7 |
| P08 | 20.375, 86.625 | 0 → 0 | 0 → 1 | 0 → 0 | 1 → 0 | 1 → 0 | 0 → 0 | 0 → 8 |
| P09 | 23.625, 87.375 | 45 → 40 | 51 → 36 | 10 → 2 | 51 → 43 | 38 → 25 | 11 → 12 | 49 → 65 |

## 3. Heat calculations and expected results

**Hot days per plant and year.** Sort that year’s seven model counts and take the fourth. Compute the two medians separately. Heat change is `2040 median − 2026 median`. The Overview uses the simple mean of the nine changes, `34 ÷ 9 = +3.78 days/year` as displayed. [Generator](../dashboard/scripts/build_data.py) · [Assessment calculations](../dashboard/src/features/assessment/assessment.ts)

**Heat Priority Score.** Normalize each input by its maximum across the whole portfolio. Multiply the combined input weight by the plant’s 2040 median hot days. Scale the highest raw priority to 100.

```text
plant scale = 0.50 × employees / max employees
            + 0.25 × cement output / max cement output
            + 0.25 × clinker produced / max clinker produced
raw priority = 2040 median hot days × plant scale
Heat Priority Score = round(100 × raw priority / highest raw priority)
```

The maxima for the nine plants are **820 employees, 3.30 Mt cement and 3.43 Mt clinker**. A factor with a zero portfolio maximum contributes 0. If the highest raw priority is zero, all heat scores are zero. Rank by the unrounded raw value. Exact ties share a rank and skip the next position, as in 1, 1, 3. Mundra and Ariyalur both display 3/100 and retain ranks 7 and 8 because their raw values differ. [Assessment calculations](../dashboard/src/features/assessment/assessment.ts)

**Worked example.** Baloda Bazar’s model counts give medians of 59 and 64, a rise of 5 days/year. Its weighted factors are approximately `0.4268 + 0.1932 + 0.2194 = 0.8394`. Multiplying the full-precision scale by 64 gives raw priority **53.7215**. It sets the benchmark and scores **100, rank 1**. [Heat research examples](../dashboard/public/docs/research/nimbus-hot-days-2026-2040.md#how-the-score-works)

| Plant | 2026 days/year | 2040 days/year | Change | Raw priority | Score /100 | Rank |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| P01 Chittorgarh | 31 | 47 | +16 | 47.0000 | 87 | 4 |
| P02 Satna | 60 | 63 | +3 | 52.2107 | 97 | 3 |
| P03 Chandrapur | 66 | 72 | +6 | 52.7247 | 98 | 2 |
| P04 Nalgonda | 48 | 55 | +7 | 30.7088 | 57 | 5 |
| P05 Ariyalur | 0 | 3 | +3 | 1.4752 | 3 | 8 |
| P06 Baloda Bazar | 59 | 64 | +5 | 53.7215 | 100 | 1 |
| P07 Mundra | 4 | 7 | +3 | 1.7448 | 3 | 7 |
| P08 Paradip | 0 | 0 | 0 | 0.0000 | 0 | 9 |
| P09 Durgapur | 45 | 36 | −9 | 7.0044 | 13 | 6 |

| Screen region | Sort order for the checked-in data |
| --- | --- |
| Overview, Extreme heat preview | Top five by 2040 median, `P03, P06, P02, P04, P01`. |
| Extreme heat, Change in hot days | Largest signed change first. Ties use the higher 2040 median, then inventory order. Expected `P01, P04, P03, P06, P02, P07, P05, P08, P09`. |
| Extreme heat, 2040 heat priorities | Highest unrounded priority first. Exact raw ties retain inventory order. Expected `P06, P03, P02, P01, P04, P09, P07, P05, P08`. |

## 4. Carbon calculations used with heat

The fixed scenario prices are **₹1,000/tCO₂ for 2026** and **₹2,700/tCO₂ for 2040**. The implementation starts at US$10/tCO₂, compounds for 14 years at the unrounded mean of the six benchmark rates (3.69%, 5.60%, 9.92%, 8.65%, 8.00%, 10.00%), converts both prices at ₹95.5063/US$ and rounds to the nearest ₹100. That gives about ₹955.06 and ₹2,678.26 before rounding. The displayed exposure is an illustrative sensitivity. [Carbon price basis and compliance inputs](../dashboard/public/docs/climate-risk-v1-transition-risk-data.md#price-formulas-and-labels)

```text
annual sensitivity (₹ crore/year) = direct CO₂ (kt) × 1,000 × scenario price / 10,000,000
plant Carbon Cost Share (%) = 100 × plant annual sensitivity / plant revenue
portfolio Carbon Cost Share (%) = 100 × total annual sensitivity / total plant revenue
carbon score = round(1 + 99 × plant 2040 share / highest plant 2040 share)
combined plant priority = (rounded Heat Priority Score + rounded carbon score) / 2
```

When the highest 2040 share is zero, every carbon score is 1. The carbon table and Overview preview sort by unrounded 2040 share and give each row a separate rank. The carbon comparison chart sorts by the 2040 rupee amount. Exact ties keep inventory order. The combined shortlist sorts by combined priority and keeps inventory order on exact ties. [Assessment calculations](../dashboard/src/features/assessment/assessment.ts)

| Plant ID | 2026 sensitivity (₹ crore/year) | 2040 sensitivity (₹ crore/year) | 2040 share | Share rank | Carbon score | Combined priority |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| P01 | 312.50 | 843.75 | 48.24% | 2 | 92 | 89.5 |
| P02 | 172.00 | 464.40 | 30.73% | 5 | 59 | 78 |
| P03 | 151.00 | 407.70 | 32.67% | 3 | 63 | 80.5 |
| P04 | 102.50 | 276.75 | 27.70% | 6 | 53 | 55 |
| P05 | 100.50 | 271.35 | 31.26% | 4 | 60 | 31.5 |
| P06 | 247.00 | 666.90 | 52.31% | 1 | 100 | 100 |
| P07 | 3.20 | 8.64 | 1.02% | 9 | 3 | 3 |
| P08 | 2.10 | 5.67 | 1.06% | 7 | 3 | 1.5 |
| P09 | 2.40 | 6.48 | 1.04% | 8 | 3 | 8 |
| **Portfolio** | **1,093.20** | **2,951.64** | **30.56%** | | | |

**Worked example.** Baloda Bazar’s 2,470 kt of direct CO₂ gives `2,470 × 1,000 × ₹2,700 ÷ 10,000,000 = ₹666.90 crore/year`. Dividing by ₹1,275 crore of FY2025–26 revenue and multiplying by 100 gives **52.31%** as displayed. Chittorgarh leads in rupees, and Baloda Bazar leads on revenue share. The combined top three are **Baloda Bazar, Chittorgarh and Chandrapur**. [Transition risk worked examples](../dashboard/public/docs/climate-risk-v1-transition-risk-data.md)

## 5. Portfolio heat and overall score

For each year, calculate the weighted mean days separately for employees, cement and clinker. Divide each sum of `plant median days × plant input` by the portfolio total of that input. Then apply the same 50% / 25% / 25% weights. A zero input total contributes 0 and leaves the other weights as they are. This gives the portfolio-weighted hot days used in Conclusions. [Assessment calculations](../dashboard/src/features/assessment/assessment.ts)

```text
W = 0.50 × employee-weighted days + 0.25 × cement-weighted days + 0.25 × clinker-weighted days
C = portfolio Carbon Cost Share in percentage units (e.g. 30.56 means 30.56%)
heat points   = min(50, W / 2)
carbon points = min(50, 1.25 × C)
Overall Business Exposure to Climate Risk Score = round(heat points + carbon points)
```

Keep full precision through the calculation. Round the final sum once, then assign the band. The review line is 50/100. Bands are 0–24 Low, 25–39 Watch, 40–49 Near review, 50–74 Concerning and 75–100 High concern. At 50 weighted days and 20% share, each component contributes 25 points. The individual caps are reached at 100 weighted days and 40% share. [Score boundary tests](../dashboard/tests/unit/assessment.test.ts)

| Year | Employee-weighted days | Cement-weighted days | Clinker-weighted days | W (days/year) | C | Heat /50 | Carbon /50 | Overall /100 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2026 baseline | 42.26 | 39.86 | 46.23 | 42.65 | 11.32% | 21.32 | 14.15 | **35 Watch** |
| 2040 scenario | 48.27 | 45.31 | 54.05 | 48.98 | 30.56% | 24.49 | 38.20 | **63 Concerning** |

**Worked example.** In 2040, `0.50 × 48.27 + 0.25 × 45.31 + 0.25 × 54.05 ≈ 48.98 days/year`. The heat component is about **24.49/50** and the carbon component about **38.20/50**. Their full-precision sum rounds to **63/100**. The portfolio-weighted hot-day change is **+6.33 days/year** as displayed. [Expected values in the calculation tests](../dashboard/tests/unit/assessment.test.ts)

## Update and verify

1. Update the CSVs under `dashboard/public/docs/` and keep the research workbook aligned if the underlying climate evidence changes.
2. From `dashboard/`, regenerate the records with `python scripts/build_data.py`.
3. Run `npm run check:data` to check the generated file and `npm test` to check the calculations. Use `npm run test:e2e` for screen, drawer and download checks. [Setup and test commands](../dashboard/README.md#verify)

The generator checks nine inventory rows with matching heat IDs, seven distinct models from the same model set at one grid centre per plant, and integer hot-day counts in `0–365` and `0–366`. `buildAssessment` rejects empty inputs, duplicate IDs and nonpositive or non-finite annual revenue. The data check fails if the generated file differs from the CSVs. [Generator validation](../dashboard/scripts/build_data.py) · [Assessment validation](../dashboard/src/features/assessment/assessment.ts) · [Browser tests](../dashboard/tests/e2e/report.spec.ts)
