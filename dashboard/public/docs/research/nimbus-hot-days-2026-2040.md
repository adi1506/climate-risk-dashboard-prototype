# Nimbus Cement heat priority at 40°C

24 November 2026

**Review Baloda Bazar, Chandrapur and Satna first.** They have the three highest 2040 Heat Priority Scores at **100, 98 and 97**. Chandrapur has the highest projected hot-day count at **72 days/year**. Chittorgarh has the largest increase at **+16 days/year**. The score combines the 2040 count with workforce size and production to prioritise plant follow-up. [NASA NEX-GDDP-CMIP6 data](https://doi.org/10.7917/OFSG3345) · [Nimbus plant inventory](../nimbus_cement_plants.csv)

## Nine-plant comparison

Each year column is the median annual count under SSP2–4.5, in days/year. The chart orders plants by 2040 minus 2026. The table orders them by their unrounded 2040 Heat Priority Score. Employee counts come from the plant inventory, and cement and clinker are reported FY2025–26 output in million tonnes (Mt). [Model counts](./nimbus-hot-days-model-counts.csv) · [Workbook with model counts and daily temperatures](../../outputs/nimbus-heat-2026-2040/nimbus-hot-days-2026-2040.xlsx) · [Nimbus plant inventory](../nimbus_cement_plants.csv)

| Priority rank | Plant | 2026 days/year | 2040 days/year | Change | Employees | Cement (Mt) | Clinker (Mt) | Priority / 100 |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | P06 Baloda Bazar | 59 | 64 | +5 | 700 | 2.55 | 3.01 | **100** |
| 2 | P03 Chandrapur | 66 | 72 | +6 | 690 | 2.40 | 1.78 | **98** |
| 3 | P02 Satna | 60 | 63 | +3 | 760 | 2.85 | 2.05 | **97** |
| 4 | P01 Chittorgarh | 31 | 47 | +16 | 820 | 3.30 | 3.43 | 87 |
| 5 | P04 Nalgonda | 48 | 55 | +7 | 540 | 1.85 | 1.22 | 57 |
| 6 | P09 Durgapur | 45 | 36 | −9 | 170 | 1.20 | 0.00 | 13 |
| 7 | P07 Mundra | 4 | 7 | +3 | 210 | 1.60 | 0.00 | 3 |
| 8 | P05 Ariyalur | 0 | 3 | +3 | 480 | 1.55 | 1.12 | 3 |
| 9 | P08 Paradip | 0 | 0 | 0 | 180 | 1.05 | 0.00 | 0 |

## How the score works

1. Divide each plant’s reported employees, cement output and clinker output by the highest value for that input across the nine plants. The portfolio maxima are **820 employees, 3.30 Mt cement and 3.43 Mt clinker**.
2. Apply weights of **50% to workforce, 25% to cement and 25% to clinker** and add the three weighted inputs.
3. Multiply that sum by the plant’s **2040 hot days** to get its raw priority.
4. Divide each raw priority by the highest raw priority and multiply by 100. Rank before rounding to the nearest whole number. Equal raw priorities share a rank.

| Worked step | Baloda Bazar | Chandrapur | Satna |
| --- | ---: | ---: | ---: |
| Workforce contribution | 50% × 700 ÷ 820 ≈ 0.4268 | 50% × 690 ÷ 820 ≈ 0.4207 | 50% × 760 ÷ 820 ≈ 0.4634 |
| Cement contribution | 25% × 2.55 ÷ 3.30 ≈ 0.1932 | 25% × 2.40 ÷ 3.30 ≈ 0.1818 | 25% × 2.85 ÷ 3.30 ≈ 0.2159 |
| Clinker contribution | 25% × 3.01 ÷ 3.43 ≈ 0.2194 | 25% × 1.78 ÷ 3.43 ≈ 0.1297 | 25% × 2.05 ÷ 3.43 ≈ 0.1494 |
| Sum of weighted inputs | 0.8394 | 0.7323 | 0.8287 |
| Raw priority after multiplying by 2040 hot days | 53.7215 | 52.7247 | 52.2107 |
| Scaled priority before whole-number rounding | 100.00 | 98.14 | 97.19 |

Baloda Bazar sets the denominator at a raw priority of approximately **53.7215**. Its higher clinker output makes the largest contribution to its lead over Chandrapur. Mundra and Ariyalur both display 3/100. Their unrounded priorities preserve the order. A plant with zero projected hot days scores zero under this screening threshold. The result compares follow-up priorities within the fixed Assessment Portfolio. [Fixed-portfolio decision](../adr/0001-hold-assessment-portfolio-fixed.md)

## Why workforce and production matter

| Input | What it captures | Why it matters for this score |
| --- | --- | --- |
| **Reported employees** | Scale of the workforce across the plant | Heat can reduce working capacity, interrupt shifts and increase heat-illness risk. Headcount indicates the potential scale of impact. Actual exposure depends on the task, conditions and duration of work. [WHO/WMO workplace heat guidance](https://www.who.int/publications/i/item/9789240099814) · [Ambuja Cements, Temperature Extremes](https://www.ambujacement.com/annual-report-2025/natural-capital.html#:~:text=Higher%20temperatures%20can%20reduce%20productivity) |
| **Cement output** | Scale of finishing operations, including standalone grinding plants | Cement output represents the volume handled by the final production stage. Higher ambient heat can strain cooling systems, bearings and belts, with consequences for equipment performance and continuity. [IEA cement manufacturing stages](https://www.iea.org/articles/driving-energy-efficiency-in-heavy-industries#cement) · [UK Environment Agency cement heat guidance](https://www.gov.uk/government/publications/adapting-to-climate-change-industry-sector-examples-for-your-risk-assessment/cement-lime-and-minerals-examples-for-your-adapting-to-climate-change-risk-assessment#summer-daily-maximum-temperature) |
| **Clinker output** | Scale of onsite kiln and clinker cooling operations | Clinker manufacture is a separate process stage with its own equipment and cooling loads. Its output also matters to the plants that rely on clinker deliveries. A grinding unit contributes through its workforce and cement output and records zero onsite clinker production. [IEA cement manufacturing stages](https://www.iea.org/articles/driving-energy-efficiency-in-heavy-industries#cement) · [EU cement BAT reference, §§1.2.5.7 and 1.2.6](https://publications.jrc.ec.europa.eu/repository/bitstream/JRC83006/clm_published_def.pdf) · [Nimbus clinker shipments](../nimbus_cement_plants.csv) |

The 2040 hot-day count represents the climate hazard. Headcount and production represent what could be affected. The V1 design gives workforce and production equal weight and divides the production half across the two process stages. Normalising each input separately lets each production stage contribute its own share of the score. Estimating productivity losses, equipment downtime or additional cooling costs requires site-specific evidence. [IPCC hazard, exposure and vulnerability framework](https://www.ipcc.ch/report/ar6/wg2/chapter/annex-ii/) · [Cement producer disclosures and impacts](./nimbus-extreme-heat-industry-benchmark.md#why-extreme-heat-is-particularly-relevant-to-cement-manufacturing)

## Source, coverage and calculation

1. **Use one source for both years.** NASA’s **NEX-GDDP-CMIP6 v2.0** publishes daily maximum near-surface air temperature (`tasmax`, in kelvin) on a 0.25° grid. The comparison uses **SSP2–4.5**, an intermediate emissions pathway, with one simulation from each of seven models. The 2026 baseline and 2040 projection both use calendar-year simulations. A complete observed 2026 record is still unavailable as of 24 November 2026 because the year is in progress. [NASA data and access](https://www.nccs.nasa.gov/data-collections/nex-gddp-cmip6/) · [NASA v2 technical note](https://www.nccs.nasa.gov/wp-content/uploads/2025/06/NEX-GDDP-CMIP6-v2-Tech_Note.pdf) · [IPCC assessment of SSP2–4.5](https://www.ipcc.ch/report/ar6/syr/summary-for-policymakers/)
2. **Match each plant to the nearest grid centre.** Download the public regional grids and match the Assessment Portfolio coordinates locally. The closest grid centre had a complete series in all 14 model-year files for each of the nine plants, including Mundra and Paradip. The centres are 1.5–13.7 km from the plant coordinates. All 63 plant–model combinations had **365 daily values in 2026** and **366 in 2040**, including 29 February, for 46,053 values in total. The workbook lists the exact grid centres and source files. [NASA regional subsetting instructions](https://www.nccs.nasa.gov/data-collections/nex-gddp-cmip6/#making-a-spatial-subset) · [Nimbus plant coordinates](../nimbus_cement_plants.csv)
3. **Count first, then take the median.** Within each model and year, count a day once if its unrounded `tasmax` is **≥313.15 K**, equivalent to **≥40°C**. A day exactly at 40°C qualifies. Take the median of the seven annual counts for each plant and year. The prototype uses the two resulting counts and calculates the priority from the 2040 count. The workbook retains the daily values behind each count. [NASA data descriptor](https://doi.org/10.1038/s41597-022-01393-4)

The model files are from [ACCESS-CM2](https://ds.nccs.nasa.gov/thredds/catalog/AMES/NEX/GDDP-CMIP6/ACCESS-CM2/ssp245/r1i1p1f1/tasmax/catalog.html), [CNRM-CM6-1](https://ds.nccs.nasa.gov/thredds/catalog/AMES/NEX/GDDP-CMIP6/CNRM-CM6-1/ssp245/r1i1p1f2/tasmax/catalog.html), [EC-Earth3](https://ds.nccs.nasa.gov/thredds/catalog/AMES/NEX/GDDP-CMIP6/EC-Earth3/ssp245/r1i1p1f1/tasmax/catalog.html), [IPSL-CM6A-LR](https://ds.nccs.nasa.gov/thredds/catalog/AMES/NEX/GDDP-CMIP6/IPSL-CM6A-LR/ssp245/r1i1p1f1/tasmax/catalog.html), [MIROC6](https://ds.nccs.nasa.gov/thredds/catalog/AMES/NEX/GDDP-CMIP6/MIROC6/ssp245/r1i1p1f1/tasmax/catalog.html), [MPI-ESM1-2-HR](https://ds.nccs.nasa.gov/thredds/catalog/AMES/NEX/GDDP-CMIP6/MPI-ESM1-2-HR/ssp245/r1i1p1f1/tasmax/catalog.html) and [MRI-ESM2-0](https://ds.nccs.nasa.gov/thredds/catalog/AMES/NEX/GDDP-CMIP6/MRI-ESM2-0/ssp245/r1i1p1f1/tasmax/catalog.html). Select the `tasmax` files ending in `_2026_v2.0.nc` and `_2040_v2.0.nc` in each catalogue.

## Reading the priority

The two calendar-year samples reflect both the scenario and year-to-year weather variability. Durgapur’s 9-day decline describes those two samples. [IPCC AR6 on climate variability](https://www.ipcc.ch/report/ar6/syr/summary-for-policymakers/) · [NASA v2 technical note, sections 5.1–5.2](https://www.nccs.nasa.gov/wp-content/uploads/2025/06/NEX-GDDP-CMIP6-v2-Tech_Note.pdf)

The heat input captures ambient air temperature frequency at the grid-cell scale. Worker exposure also depends on humidity, radiant heat from equipment, and workload. A low portfolio priority can coexist with substantial heat stress at an individual workplace. [NASA dataset scope](https://www.nccs.nasa.gov/data-collections/nex-gddp-cmip6/) · [Nimbus cement-industry heat criteria](./nimbus-extreme-heat-cement-criteria.md)

The Climate Analytics Group and NASA Ames Research Center prepared the climate scenarios using NASA Earth Exchange. The NASA Center for Climate Simulation distributes the data. [NASA attribution and terms](https://www.nccs.nasa.gov/wp-content/uploads/2025/06/NEX-GDDP-CMIP6-v2-Tech_Note.pdf)
