import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildAssessment } from '../../src/features/assessment/assessment.ts'
import { plantRecords } from '../../src/features/assessment/plant-records.ts'

test('reproduces the published carbon sensitivities and revenue-weighted portfolio share', () => {
  const { carbonScenario, carbonRanking, sensitivityRanking, totals } = buildAssessment(plantRecords)

  assert.equal(carbonScenario.baseline.roundedRupees, 1_000)
  assert.equal(carbonScenario.future.roundedRupees, 2_700)
  // Independently published in the Stage 4 transition risk data table.
  assert.deepEqual(carbonRanking.map(plant => [plant.id, plant.costShare.toFixed(2), plant.carbonScore]), [
    ['P06', '52.31', 100], ['P01', '48.24', 92], ['P03', '32.67', 63],
    ['P05', '31.26', 60], ['P02', '30.73', 59], ['P04', '27.70', 53],
    ['P08', '1.06', 3], ['P09', '1.04', 3], ['P07', '1.02', 3],
  ])
  assert.deepEqual(sensitivityRanking.map(plant => plant.id), ['P01', 'P06', 'P02', 'P03', 'P04', 'P05', 'P07', 'P09', 'P08'])
  assert.equal(sensitivityRanking[0].futureSensitivity, 843.75)
  assert.equal(carbonRanking[0].baselineSensitivity, 247)
  assert.equal(carbonRanking[0].futureSensitivity, 666.90)
  assert.equal(totals.revenue, 9_658)
  assert.equal(totals.directEmissions, 10_932_000)
  assert.equal(totals.baselineSensitivity.toFixed(2), '1093.20')
  assert.equal(totals.futureSensitivity.toFixed(2), '2951.64')
  assert.equal(totals.share.toFixed(2), '30.56')
})

test('uses the published heat inputs, ranks by unrounded priority, and retains signed changes', () => {
  const report = buildAssessment(plantRecords)

  assert.deepEqual(report.heatPriorityRanking.map(plant => [plant.id, plant.heatPriority.rank, plant.heatPriority.score]), [
    ['P06', 1, 100], ['P03', 2, 98], ['P02', 3, 97], ['P01', 4, 87], ['P04', 5, 57],
    ['P09', 6, 13], ['P07', 7, 3], ['P05', 8, 3], ['P08', 9, 0],
  ])
  assert.equal(report.heatPriorityRanking[0].heatPriority.raw.toFixed(4), '53.7215')
  assert.deepEqual(report.heatPriorityRanking[0].heatPriority.factors.map(factor => factor.contribution.toFixed(4)), ['0.4268', '0.1932', '0.2194'])
  assert.deepEqual(report.heatChangeRanking.map(plant => plant.id), ['P01', 'P04', 'P03', 'P06', 'P02', 'P07', 'P05', 'P08', 'P09'])
  assert.equal(report.heatIncrease.name, 'Chittorgarh')
  assert.equal(report.averageHeatChange.toFixed(1), '3.8')
})

test('matches the overview and conclusions of the worked Stage 4 assessment', () => {
  const { portfolioExposure, priorityPlants, combinedPriority } = buildAssessment(plantRecords)
  const { baseline, future } = portfolioExposure

  assert.deepEqual([baseline.hotDays.toFixed(2), future.hotDays.toFixed(2)], ['42.65', '48.98'])
  assert.deepEqual(future.heatFactors.map(({ days }) => days.toFixed(2)), ['48.27', '45.31', '54.05'])
  assert.deepEqual([baseline.carbonShare.toFixed(2), future.carbonShare.toFixed(2)], ['11.32', '30.56'])
  assert.deepEqual([baseline.heatPoints.toFixed(2), future.heatPoints.toFixed(2)], ['21.32', '24.49'])
  assert.deepEqual([baseline.carbonPoints.toFixed(2), future.carbonPoints.toFixed(2)], ['14.15', '38.20'])
  assert.deepEqual([baseline.score, future.score], [35, 63])
  assert.deepEqual([baseline.band?.label, future.band?.label], ['Watch', 'Concerning'])
  assert.deepEqual(priorityPlants.map(plant => [plant.id, combinedPriority(plant)]), [
    ['P06', 100], ['P01', 89.5], ['P03', 80.5],
  ])
})

test('shares exact heat ranks and handles portfolios without clinker, cement or emissions', () => {
  const records = [20, 20, 5, 0].map((future, index) => ({
    ...plantRecords[index], employees: 100, cement: 0, clinker: 0, emissions: 0,
    heat: { ...plantRecords[index].heat, baseline: 0, future },
  }))
  const { heatPriorityRanking, carbonRanking, portfolioExposure } = buildAssessment(records)

  assert.deepEqual(heatPriorityRanking.map(({ heatPriority }) => [heatPriority.rank, heatPriority.score]), [
    [1, 100], [1, 100], [3, 25], [4, 0],
  ])
  assert.deepEqual(carbonRanking.map(plant => plant.carbonScore), [1, 1, 1, 1])
  assert.equal(portfolioExposure.future.hotDays, 5.625)
  assert.equal(portfolioExposure.future.carbonPoints, 0)
  assert.equal(portfolioExposure.baseline.score, 0)
})

test('caps each exposure component and assigns the band after rounding the sum', () => {
  const plant = plantRecords[0]
  const { portfolioExposure: { baseline, future } } = buildAssessment([{
    ...plant,
    // At the baseline price, this adds 0.25 points to a 49.5-point heat contribution.
    emissions: 20,
    revenue: 1_000,
    heat: { ...plant.heat, baseline: 99, future: 180 },
  }])
  assert.equal(baseline.score, 50)
  assert.equal(baseline.band?.id, 'concerning')
  assert.equal(future.heatPoints, 50)

  const highCarbon = buildAssessment([{ ...plant, emissions: 10_000, revenue: 1_000 }]).portfolioExposure.future
  assert.equal(highCarbon.carbonPoints, 50)
})

test('rejects portfolios with missing denominators or ambiguous plant IDs', () => {
  const plant = plantRecords[0]
  assert.throws(() => buildAssessment([]), /positive annual revenue/)
  assert.throws(() => buildAssessment([{ ...plant, revenue: 0 }]), /positive annual revenue/)
  assert.throws(() => buildAssessment([plant, plant]), /unique plant IDs/)
})
