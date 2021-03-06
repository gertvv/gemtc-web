## Test invocation
source('../gemtc.R')
library(RJSONIO)
library(gemtc)
update <- print
params <- '{"entries":[{"study":"Nemeroff et al, 1995","treatment":"Sertraline","sampleSize":46,"mean":-1.52,"std.dev":0.96},{"study":"Ekselius et al, 1997","treatment":"Sertraline","sampleSize":200,"mean":-2.9,"std.dev":0.8},{"study":"Burke et al, 2002","treatment":"Placebo","sampleSize":119,"mean":-0.8,"std.dev":0.1},{"study":"Bielski et al, 2004","treatment":"Venlafaxine","sampleSize":100,"mean":-1.7,"std.dev":1.2},{"study":"Kiev and Feiger, 1997","treatment":"Paroxetine","sampleSize":30,"mean":-1.52,"std.dev":1.18},{"study":"Chouinard et al, 1999","treatment":"Fluoxetine","sampleSize":101,"mean":-1.8,"std.dev":0.16},{"study":"Chouinard et al, 1999","treatment":"Paroxetine","sampleSize":102,"mean":-0.69,"std.dev":0.16},{"study":"Aberg-Wistedt et al, 2000","treatment":"Paroxetine","sampleSize":177,"mean":-2.5,"std.dev":1.6},{"study":"Aberg-Wistedt et al, 2000","treatment":"Sertraline","sampleSize":176,"mean":-2.6,"std.dev":1.5},{"study":"Detke et al, 2004","treatment":"Paroxetine","sampleSize":85,"mean":-2.1,"std.dev":0.1},{"study":"Detke et al, 2004","treatment":"Placebo","sampleSize":93,"mean":-1.5,"std.dev":0.1},{"study":"McPartlin et al, 1998","treatment":"Paroxetine","sampleSize":178,"mean":-2.3,"std.dev":1.4},{"study":"McPartlin et al, 1998","treatment":"Venlafaxine","sampleSize":183,"mean":-2.3,"std.dev":1.3}]}'
cat(toJSON(gemtc(fromJSON(params))))

test_that("5 equals 5", {
  expect_that(5, equals(5))
})
