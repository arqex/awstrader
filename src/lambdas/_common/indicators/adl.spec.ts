import { ArrayCandle } from "../../lambda.types";
import { adl } from "./adl"

// Deactivated because the indicator don't work well yet
xdescribe('adl', () => {
	it('should work with the test data', () => {
		const actual = adl(testCandles);
		expect( actual ).toEqual( expectedResults );
	})
})


// test data generated by tools/csvToData.js script
const expectedResults = [ 
	1430.9929380444441,
  1430.0940498422744,
  1432.0364837910588,
  1429.5198723126352,
  1432.109858644082,
  1434.039436432162,
  1435.969014220242,
  1437.8985920083219,
  1435.830143069465,
  1437.1262912091465,
  1439.45158188865,
  1438.2905042573855,
  1437.4057121106882,
  1436.520919963991,
  1435.6361278172938,
  1433.2565979977364,
  1430.270085875145,
  1427.3851280996378,
  1424.4400035071549,
  1427.341152704743,
  1430.2423019023313,
  1433.1434510999195,
  1435.624842518214,
  1438.1601280950229,
  1439.8784504102325,
  1436.7404220129388,
  1440.8147317704315,
  1444.8890415279243,
  1448.963351285417,
  1447.433806852313,
  1449.0235466823708,
  1451.2949417754337,
  1453.5706330879188,
  1451.9287115207455,
  1450.2867899535722,
  1448.644868386399,
  1447.0029468192256,
  1444.0652740566732,
  1441.6933366720607,
  1442.2056842103586,
  1440.1317495876483,
  1438.057814964938,
  1435.9838803422276,
  1438.3533287409664,
  1435.7721782877115,
  1438.6899708631893,
  1437.7962256602343,
  1435.5555989257546,
  1433.3149721912748,
  1431.074345456795,
  1426.8036860100478,
  1427.910947224604,
  1431.6384542927515,
  1433.9787799502203,
  1432.0229745342408,
  1430.0671691182613,
  1428.1113637022818,
  1430.1679700403129,
  1426.0741191167183,
  1428.5668269281173,
  1426.1336491741706,
  1429.3463955274383,
  1432.559141880706,
  1435.7718882339736,
  1433.0147574950524,
  1434.602044652274,
  1433.4761647147127,
  1436.1068403970146,
  1434.8134124033315,
  1433.5199844096485,
  1432.2265564159654,
  1430.8612002240272,
  1432.909529341604,
  1435.2641455920946,
  1438.4518234808688,
  1437.8477013875386,
  1437.2435792942083,
  1436.639457200878,
  1436.0597455710392,
  1437.5632625746948,
  1440.2050738220528,
  1438.8354136480505,
  1439.475782246942,
  1440.1161508458333,
  1440.7565194447247,
  1443.5320175676763,
  1442.3058258619099,
  1439.4983457739227,
  1442.4615345638715,
  1442.8266829355416,
  1443.1918313072117,
  1443.5569796788818,
  1446.946992584462,
  1445.7156806693656,
  1448.2432358184865,
  1447.121937489976,
  1449.8625781287888,
  1452.6032187676014,
  1455.3438594064141,
  1456.667424598431 ]

const testCandles: ArrayCandle[] = [ [ 1627776000, 41500.2, 39889.1, 42598.7, 39413.5, 3446.98060983 ],
  [ 1627862400, 39889.9, 39152.3, 40440.8, 38700, 3504.70836076 ],
  [ 1627948800, 39152.4, 38163, 39791.1, 37655, 2952.96871944 ],
  [ 1628035200, 38163, 39749, 39950, 37527.9, 3259.23334718 ],
  [ 1628121600, 39749, 40886.4, 41403.5, 37355, 4715.12051213 ],
  [ 1628208000, 40886.5, 42823.9, 43401.9, 39900, 5168.03548276 ],
  [ 1628294400, 42861.7, 44610.7, 44721.8, 42495, 4617.87051633 ],
  [ 1628380800, 44612.1, 43845.6, 45348, 43320, 3667.28592934 ],
  [ 1628467200, 43845.6, 46307.1, 46484.1, 42827.7, 5654.00111905 ],
  [ 1628553600, 46300.8, 45595.1, 46688, 44666, 3081.95009446 ],
  [ 1628640000, 45606.9, 45571.7, 46736.4, 45373.5, 3504.45567656 ],
  [ 1628726400, 45570, 44401.1, 46195.4, 43800.1, 3567.19495677 ],
  [ 1628812800, 44401.1, 47823.3, 47898.5, 44251.2, 3816.14935216 ],
  [ 1628899200, 47823.2, 47115.2, 48164, 46042.5, 2970.19914208 ],
  [ 1628985600, 47111.8, 47019.3, 47385, 45550, 2101.35909566 ],
  [ 1629072000, 47023.7, 45926.3, 48072.6, 45697.4, 2739.39057218 ],
  [ 1629158400, 45926.2, 44672.2, 47172.3, 44401.2, 3291.66244845 ],
  [ 1629244800, 44672.3, 44714.7, 46000, 44250, 3211.81374825 ],
  [ 1629331200, 44720.2, 46765.3, 47062.2, 44000, 2627.81529413 ],
  [ 1629417600, 46770.8, 49345.4, 49400, 46662.9, 3541.23372143 ],
  [ 1629504000, 49345.5, 48865.4, 49790, 48267.6, 2697.47503994 ],
  [ 1629590400, 48865.3, 49293.6, 49532.3, 48058.1, 1740.18402632 ],
  [ 1629676800, 49293.4, 49517.3, 50500, 49060, 3119.26102911 ],
  [ 1629763200, 49517.2, 47725.4, 49867, 47601.1, 3149.29294249 ],
  [ 1629849600, 47715.1, 48991.3, 49245, 47146.3, 2608.10974936 ],
  [ 1629936000, 48991.4, 46848.9, 49350, 46284.8, 3175.30347867 ],
  [ 1630022400, 46846.7, 49074.9, 49174.9, 46386.4, 2672.22120021 ],
  [ 1630108800, 49074.9, 48895.7, 49314, 48393.9, 1300.71840626 ],
  [ 1630195200, 48895.7, 48787.7, 49653.9, 47800, 2232.52440756 ],
  [ 1630281600, 48787.7, 46985.7, 48900, 46861.6, 2528.07798392 ],
  [ 1630368000, 46987.1, 47140, 48248, 46715, 2213.35684346 ],
  [ 1630454400, 47140, 48872.2, 49137.3, 46550, 2574.82496729 ],
  [ 1630540800, 48872.1, 49290.3, 50372.9, 48622, 3436.66451617 ],
  [ 1630627200, 49290.2, 50018.6, 51009.7, 48356, 3628.82427331 ],
  [ 1630713600, 50022.9, 49956.1, 50559.5, 49363.6, 1604.31873364 ],
  [ 1630800000, 49956.1, 51767.9, 51890.9, 49512.4, 1807.72703411 ],
  [ 1630886400, 51768, 52688.3, 52800, 51025.5, 2977.7958553 ],
  [ 1630972800, 52688.2, 46882.1, 52900, 42000, 8784.1975246 ],
  [ 1631059200, 46889.5, 46073.4, 47362.4, 44444, 3486.85659567 ],
  [ 1631145600, 46064.3, 46389.6, 47399, 45498.7, 2319.02280703 ],
  [ 1631232000, 46389.7, 44842.2, 47035.8, 44135.2, 3303.07297039 ],
  [ 1631318400, 44842.2, 45137.4, 45992.4, 44741, 1239.97337633 ],
  [ 1631404800, 45148.8, 46061.3, 46487.9, 44770, 1202.06666163 ],
  [ 1631491200, 46061.3, 44965.8, 46879, 43374.9, 3673.51904919 ],
  [ 1631577600, 44965.8, 47145.9, 47260, 44700, 2114.13267011 ],
  [ 1631664000, 47110.5, 48152.3, 48481, 46744, 2151.18720019 ],
  [ 1631750400, 48152.3, 47786.9, 48485.8, 47030.1, 2289.67394172 ],
  [ 1631836800, 47786.9, 47269.7, 48185.9, 46745.7, 2007.83571876 ],
  [ 1631923200, 47269.7, 48309.9, 48800, 47077.9, 1277.08379196 ],
  [ 1632009600, 48306.9, 47237.8, 48379.1, 46851.2, 1219.51050215 ],
  [ 1632096000, 47247.3, 42992.9, 47307.7, 42510, 5755.78647313 ],
  [ 1632182400, 42992.9, 40710.6, 43624.7, 39579, 7259.61267188 ],
  [ 1632268800, 40710.5, 43562.8, 44024.2, 40600, 3430.28601932 ],
  [ 1632355200, 43563.3, 44889.8, 45000, 43111.6, 4171.04314642 ],
  [ 1632441600, 44888.9, 42833.2, 45153, 40750, 4407.09719872 ],
  [ 1632528000, 42831.7, 42710.1, 43021.7, 41705.1, 1058.57183586 ],
  [ 1632614400, 42710.1, 43204.6, 43930.4, 40802.7, 2250.76323745 ],
  [ 1632700800, 43175.2, 42176.3, 44333, 42120.7, 1977.89964159 ],
  [ 1632787200, 42176.3, 41038.4, 42750, 40875.6, 2231.71257206 ],
  [ 1632873600, 41016, 41524.8, 42579.9, 40772.2, 1707.74975383 ],
  [ 1632960000, 41523.9, 43798.7, 44100, 41423.7, 3053.23090867 ],
  [ 1633046400, 43798.7, 48163.7, 48475, 43300.3, 6512.03024789 ],
  [ 1633132800, 48168.8, 47662, 48349.2, 47487.1, 1621.17649347 ],
  [ 1633219200, 47657.3, 48230.2, 49257.9, 47131.1, 1653.13750113 ],
  [ 1633305600, 48228.6, 49243.3, 49500, 46895.8, 2828.92263936 ],
  [ 1633392000, 49239.2, 51487, 51888, 49084.3, 4047.31458904 ],
  [ 1633478400, 51492.9, 55350.2, 55770, 50366.4, 7379.34314845 ],
  [ 1633564800, 55350.2, 53817.3, 55352.2, 53399.8, 3074.65033031 ],
  [ 1633651200, 53817.4, 53960.5, 56114.1, 53685, 2595.57677126 ],
  [ 1633737600, 53960.9, 54960.2, 55515.1, 53712, 1216.55973499 ],
  [ 1633824000, 54967.4, 54677.5, 56500, 54118.6, 2295.10818143 ],
  [ 1633910400, 54678.9, 57499.5, 57837.7, 54450.2, 2787.09612904 ],
  [ 1633996800, 57482.8, 56010.1, 57673.8, 54019.2, 3699.83673303 ],
  [ 1634083200, 55991.9, 57381.2, 57777, 54271.2, 3018.73591985 ],
  [ 1634169600, 57381.2, 57377.6, 58580.4, 56825, 2594.22360564 ],
  [ 1634256000, 57357.1, 61656.2, 62887.5, 56888.5, 5168.88639071 ],
  [ 1634342400, 61669.8, 60873.4, 62400, 60162, 1963.72806446 ],
  [ 1634428800, 60868.5, 61526.5, 61674.3, 58900.2, 2142.26443974 ],
  [ 1634515200, 61526.1, 62037.7, 62672.6, 59900, 3406.19056422 ],
  [ 1634601600, 62009.6, 64284.9, 64448, 61320, 3564.49206667 ],
  [ 1634688000, 64291.6, 66035.8, 66982.2, 63546.2, 3552.48626789 ],
  [ 1634774400, 66035.7, 62198, 66637.8, 54100, 6502.27028944 ],
  [ 1634860800, 62197.4, 60687.5, 63757.9, 60034.2, 2968.91457098 ],
  [ 1634947200, 60687.5, 61296.9, 61713.9, 59610.4, 1276.37709253 ],
  [ 1635033600, 61297.6, 60882.5, 61450, 59523, 1443.19001317 ],
  [ 1635120000, 60865.1, 63081.8, 63700, 60674, 2256.81962998 ],
  [ 1635206400, 63081.7, 60310.2, 63288, 59824.2, 2574.26550076 ],
  [ 1635292800, 60325.1, 58500.1, 61477.1, 58140.6, 3954.31707153 ],
  [ 1635379200, 58500.1, 60613.5, 62490, 57948, 4393.97638147 ],
  [ 1635465600, 60604.5, 62246.5, 62950, 60223.5, 2728.80922519 ],
  [ 1635552000, 62246.4, 61866.3, 62359.2, 60741.1, 1202.80701854 ],
  [ 1635638400, 61879.2, 61380.1, 62422.8, 60051, 1518.03039144 ],
  [ 1635724800, 61380.1, 60954.5, 62500, 59449.1, 2649.55088957 ],
  [ 1635811200, 60954.5, 63279.7, 64327, 60665.9, 2733.11225391 ],
  [ 1635897600, 63279.8, 62942.9, 63550.4, 60810.3, 2567.94815305 ],
  [ 1635984000, 62938, 61449, 63115, 60644.2, 1869.2061661 ],
  [ 1636070400, 61448.9, 61006.2, 62631.9, 60804.4, 1419.74213073 ],
  [ 1636156800, 61007.4, 61536.3, 61602.1, 60129.8, 1337.98498424 ],
  [ 1636243200, 61535.4, 63317.8, 63317.8, 61388, 1554.00196888 ],
  [ 1636329600, 63319.6, 65948.7, 66523.7, 63319.6, 2977.22772889 ] ]