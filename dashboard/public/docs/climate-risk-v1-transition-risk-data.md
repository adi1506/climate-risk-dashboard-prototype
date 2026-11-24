# V1 transition risk data and display rules

**How does annual Carbon Price Sensitivity change between the 2026 and 2040 scenarios, and which plants face the greatest 2040 carbon cost relative to revenue?**

Baloda Bazar ranks first on 2040 Carbon Cost Share at **52.31%**. Chittorgarh ranks second on share and has the largest 2040 annual sensitivity at **₹843.75 crore/year**. The paired chart orders plants by 2040 sensitivity. The table orders plants by 2040 Carbon Cost Share. Plant evidence shows both annual amounts and the 2040 share and rank. [Nimbus plant data](./nimbus_cement_plants.csv)

## Values to display

| 2040 rank | Plant | FY2025–26 direct CO₂ (kt) | 2026 sensitivity (₹ crore/year) | 2040 sensitivity (₹ crore/year) | 2040 Carbon Cost Share | Internal First checks input / 100 |
| ---: | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | P06 Baloda Bazar | 2,470 | 247.00 | 666.90 | 52.31% | **100** |
| 2 | P01 Chittorgarh | 3,125 | 312.50 | 843.75 | 48.24% | **92** |
| 3 | P03 Chandrapur | 1,510 | 151.00 | 407.70 | 32.67% | **63** |
| 4 | P05 Ariyalur | 1,005 | 100.50 | 271.35 | 31.26% | **60** |
| 5 | P02 Satna | 1,720 | 172.00 | 464.40 | 30.73% | **59** |
| 6 | P04 Nalgonda | 1,025 | 102.50 | 276.75 | 27.70% | **53** |
| 7 | P08 Paradip | 21 | 2.10 | 5.67 | 1.06% | **3** |
| 8 | P09 Durgapur | 24 | 2.40 | 6.48 | 1.04% | **3** |
| 9 | P07 Mundra | 32 | 3.20 | 8.64 | 1.02% | **3** |
| | **Nimbus portfolio** | **10,932** | **1,093.20** | **2,951.64** | **30.56%** | |

## Price, formulas, and labels

Use **₹1,000/tCO₂ in the 2026 scenario** and **₹2,700/tCO₂ in the 2040 scenario**. EY-Parthenon starts its normative cement scenario at US$10/tCO₂ in 2026 and uses the mean of six EU carbon-price growth benchmarks (3.69%, 5.60%, 9.92%, 8.65%, 8.00% and 10.00%). Compounding the unrounded mean for 14 years gives `US$10 × (1 + 0.076433…)^14 ≈ US$28.04/tCO₂`. Convert both nominal US dollar prices at the October 2026 average of ₹95.5063 per dollar, giving ₹955.06 and about ₹2,678.26 per tonne. Round each to the nearest ₹100. The peer shadow-price median supplies a separate benchmark for the magnitude of the 2040 value. [EY-Parthenon, p. 19 and p. 25](./research/nimbus-carbon-pricing-benchmarks.md#implications-for-the-dashboard) · [Fixed-portfolio decision](./adr/0001-hold-assessment-portfolio-fixed.md)

1. **Annual Carbon Price Sensitivity (₹ crore/year)** is `FY2025–26 direct CO₂ (kt) × 1,000 × rounded scenario price ÷ 10,000,000`. Apply the same emissions to both years.
2. **2040 Carbon Cost Share (%)** is `2040 annual sensitivity ÷ FY2025–26 plant revenue × 100`. For the portfolio, divide total 2040 sensitivity by the sum of the reported plant revenues, ₹9,658 crore.
3. **First checks** scales the unrounded plant Carbon Cost Share using `round(1 + 99 × plant Carbon Cost Share ÷ highest plant Carbon Cost Share)`. It gives this value equal weight with the Heat Priority Score when ordering the shortlist. The Carbon cost comparison ranks by unrounded share and reports amounts and shares to two decimals.

At Baloda Bazar, 2,470,000 tonnes × ₹2,700 gives ₹666.90 crore per year. Dividing by ₹1,275 crore of FY2025–26 plant revenue gives a Carbon Cost Share of 52.31%.

## Compliance and decarbonisation evidence

The portfolio table is a sensitivity on reported direct CO₂. A CCTS compliance estimate requires confirmed facility coverage and a notified target, verified emissions intensity, equivalent product output, eligible banked credits, and the purchase price of any remaining credits. The Nimbus data currently lacks those inputs. Process emissions from limestone calcination guide the investigation toward clinker substitution, fuel changes, kiln efficiency, and other feasible reductions. [Indian emissions-intensity rules](https://beeindia.gov.in/WriteReadData/L45218/1663540214634949.pdf#page=30) · [CERC certificate trading regulations](https://cercind.gov.in/regulations/GZ-205.pdf#page=9) · [Cement decarbonisation roadmap](https://www.niti.gov.in/sites/default/files/2026-01/Roadmap_for_Cement_Sector_Decarbonaisation.pdf)

At Baloda Bazar, verify the compliance inputs first. Then get the split of direct emissions by source and compare feasible projects by annual tonnes avoided, cost per tonne, capital required, and time to implement. Check retrofit fit and downtime for its 2022 kiln and the effect on the **1.28 Mt/year** of clinker it supplies to Paradip and Durgapur. The grinding units’ direct tonnes remain attributed to their reporting sites, and the clinker relationship provides context for follow-up. [Nimbus plant data](./nimbus_cement_plants.csv)
