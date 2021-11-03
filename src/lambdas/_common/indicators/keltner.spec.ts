import { keltner } from "./keltner";

describe('keltner',  () => {
  it('should return right results for candles', () => {
    // @ts-ignore 
    const results = keltner(testCandles, {maPeriod:20}).slice(19);
    expect( results ).toEqual(expectedResults);
  })
})

const testCandles = [[0,0,227.49,227.82,226.96],[0,0,227.62,228.89,227.42],[0,0,227.3,228.04,227.07],[0,0,227.93,228.33,227.3],[0,0,227.37,227.94,227.29],[0,0,229.39,229.44,227.37],[0,0,228.9,229.59,228.69],[0,0,229.06,229.07,228.24],[0,0,227.71,229.06,227.7],[0,0,227.68,227.88,227.57],[0,0,228.14,228.26,227.5],[0,0,226.96,228.14,226.5],[0,0,227.31,227.44,226.8],[0,0,227.92,228.2,227],[0,0,228.09,228.1,227.67],[0,0,228.24,228.24,228.09],[0,0,227.71,228.45,227.7],[0,0,228.2,228.2,226.95],[0,0,227.46,228.43,226.82],[0,0,227.18,227.47,226.77],[0,0,227.06,227.59,226.92],[0,0,226.12,227.09,225.59],[0,0,225.78,226.3,225.12],[0,0,225.07,225.78,225.06],[0,0,226.02,226.21,225.06],[0,0,226.44,226.45,226],[0,0,225.74,226.45,225.63],[0,0,225.99,226,225.6],[0,0,226.61,226.94,225.99],[0,0,226.33,226.85,226.2],[0,0,225.97,226.33,225.5],[0,0,225.91,225.97,225.28],[0,0,226.36,226.45,225.9],[0,0,226.15,226.7,225.83],[0,0,225.91,226.25,225.81],[0,0,225.08,226.04,224.37],[0,0,225.03,225.28,224.93],[0,0,223.95,225.03,223.55],[0,0,222.99,223.99,222.99],[0,0,222.19,222.99,221.59],[0,0,223.09,223.25,221.52],[0,0,222.8,223.09,222.32],[0,0,222.68,222.91,222.22],[0,0,222.78,223.02,222.6],[0,0,222.95,223.01,222.52],[0,0,222.96,223.21,222.69],[0,0,223.8,223.8,222.95],[0,0,223.77,223.9,223.36],[0,0,223.06,223.77,223.01],[0,0,221.94,223.08,221.73],[0,0,222.8,222.89,221.89],[0,0,223.59,223.9,222.79],[0,0,224.35,224.39,223.38],[0,0,223.37,224.36,222.79],[0,0,223.35,223.67,223.29],[0,0,222.99,223.46,222.93],[0,0,222.76,223.06,222.73],[0,0,223.61,223.89,222.66],[0,0,217.19,223.61,216.41],[0,0,202.24,217.19,195.1],[0,0,200.26,203.33,197.51],[0,0,201.22,203.51,200.07],[0,0,201.65,202.86,201],[0,0,200.38,202.84,198.52],[0,0,196.83,200.38,192.5],[0,0,197.28,197.64,194.43],[0,0,198.47,199.12,197.19],[0,0,197.55,198.47,196.64],[0,0,198.02,198.14,196.94],[0,0,195.58,198.02,194.62],[0,0,197.06,197.5,195.59],[0,0,198.87,199.5,193.49],[0,0,199.33,201.1,198.87],[0,0,197.9,199.83,197.43],[0,0,198.76,199.86,197.79],[0,0,199.79,200.66,198.76],[0,0,197.96,199.9,197.94],[0,0,198.76,199.64,197.87],[0,0,197.9,198.82,194.44],[0,0,197.08,198.32,196.92],[0,0,196.34,197.4,195.55],[0,0,188.32,197.45,184.81],[0,0,189.93,190.72,187.15],[0,0,191.64,192.93,189.92],[0,0,192.44,193,191.63],[0,0,193.55,193.98,190.77],[0,0,193.68,194.6,192.61],[0,0,192.82,193.9,192.62],[0,0,195.35,196.76,192.65],[0,0,195.89,198.5,195.2],[0,0,195.82,196.25,195],[0,0,193.48,196,193.3],[0,0,194.75,194.94,193.49],[0,0,194.35,195.07,193.3],[0,0,195.17,195.71,193.98],[0,0,195.45,195.71,194.5],[0,0,194.64,195.5,194.54],[0,0,196.3,198,194.26],[0,0,196.01,196.84,195.86],[0,0,193.95,196.25,193.52],[0,0,193.89,194.49,193.6],[0,0,195.36,195.5,193.89],[0,0,195.16,195.6,195.02]];
const expectedResults = [ 
  { middle: 227.88299999999998,
    upper: 228.84785104110847,
    lower: 226.9181489588915 },
  { middle: 227.804619047619,
    upper: 228.73998498461665,
    lower: 226.86925311062137 },
  { middle: 227.64417913832196,
    upper: 228.63600848161985,
    lower: 226.65234979502407 },
  { middle: 227.4666382680056,
    upper: 228.47728467697368,
    lower: 226.4559918590375 },
  { middle: 227.23838700438603,
    upper: 228.21996877245732,
    lower: 226.25680523631473 },
  { middle: 227.12235014682545,
    upper: 228.1207737380896,
    lower: 226.1239265555613 },
  { middle: 227.05736441855635,
    upper: 228.0009456506941,
    lower: 226.1137831864186 },
  { middle: 226.9319011405986,
    upper: 227.86312424952257,
    lower: 226.00067803167462 },
  { middle: 226.8421962700654,
    upper: 227.72029706809695,
    lower: 225.96409547203382 },
  { middle: 226.82008233958297,
    upper: 227.70537305781139,
    lower: 225.93479162135455 },
  { middle: 226.77340783105126,
    upper: 227.63516947745683,
    lower: 225.9116461846457 },
  { middle: 226.69689279952257,
    upper: 227.55547828128758,
    lower: 225.83830731775757 },
  { middle: 226.62195062813947,
    upper: 227.463677561728,
    lower: 225.78022369455095 },
  { middle: 226.59700294926904,
    upper: 227.4095571894987,
    lower: 225.78444870903937 },
  { middle: 226.55443123981485,
    upper: 227.37273005602154,
    lower: 225.73613242360815 },
  { middle: 226.49305683602296,
    upper: 227.27352577060898,
    lower: 225.71258790143693 },
  { middle: 226.35847999449697,
    upper: 227.2279020356244,
    lower: 225.48905795336955 },
  { middle: 226.23195809025916,
    upper: 227.04943792727383,
    lower: 225.41447825324448 },
  { middle: 226.0146287483297,
    upper: 226.8983606016429,
    lower: 225.1308968950165 },
  { middle: 225.7265688675364,
    upper: 226.6219275355183,
    lower: 224.8312101995545 },
  { middle: 225.3897527849139,
    upper: 226.3355755860976,
    lower: 224.4439299837302 },
  { middle: 225.1707287101602,
    upper: 226.19496923122554,
    lower: 224.14648818909487 },
  { middle: 224.94494502347828,
    upper: 225.9437614924371,
    lower: 223.94612855451948 },
  { middle: 224.7292359736232,
    upper: 225.6971707956861,
    lower: 223.76130115156028 },
  { middle: 224.54359445232572,
    upper: 225.45673579218234,
    lower: 223.6304531124691 },
  { middle: 224.3918235521042,
    upper: 225.26265075797517,
    lower: 223.52099634623323 },
  { middle: 224.25545940428475,
    upper: 225.09120388956862,
    lower: 223.41971491900088 },
  { middle: 224.2120823181624,
    upper: 225.04925235491788,
    lower: 223.37491228140692 },
  { middle: 224.16997924024216,
    upper: 224.97743227332208,
    lower: 223.36252620716223 },
  { middle: 224.06426693164767,
    upper: 224.86697466141962,
    lower: 223.2615592018757 },
  { middle: 223.86195579530028,
    upper: 224.71939275209502,
    lower: 223.00451883850553 },
  { middle: 223.7608171481288,
    upper: 224.63251040924408,
    lower: 222.88912388701354 },
  { middle: 223.744548848307,
    upper: 224.64007278331076,
    lower: 222.84902491330325 },
  { middle: 223.80221086275395,
    upper: 224.70918240425732,
    lower: 222.89523932125059 },
  { middle: 223.76104792344407,
    upper: 224.7343223107971,
    lower: 222.78777353609104 },
  { middle: 223.7219005021637,
    upper: 224.63584745078143,
    lower: 222.80795355354596 },
  { middle: 223.65219569243382,
    upper: 224.52774794618978,
    lower: 222.77664343867787 },
  { middle: 223.5672246741068,
    upper: 224.38822170248716,
    lower: 222.74622764572644 },
  { middle: 223.57129851466806,
    upper: 224.43319584021037,
    lower: 222.70940118912574 },
  { middle: 222.96355579898537,
    upper: 224.45926339197345,
    lower: 221.46784820599729 },
  { middle: 220.9898838181296,
    upper: 224.5450206518189,
    lower: 217.43474698444032 },
  { middle: 219.01560916878393,
    upper: 222.7972323191043,
    lower: 215.23398601846355 },
  { middle: 217.32078924794737,
    upper: 221.0682500832357,
    lower: 213.57332841265904 },
  { middle: 215.82833312909526,
    upper: 219.38704788085474,
    lower: 212.26961837733577 },
  { middle: 214.35706330727666,
    upper: 217.9919065838602,
    lower: 210.7222200306931 },
  { middle: 212.68781918277412,
    upper: 216.74717813169931,
    lower: 208.62846023384893 },
  { middle: 211.22040783203374,
    upper: 215.1948308860664,
    lower: 207.2459847780011 },
  { middle: 210.00608327660194,
    upper: 213.77606402523134,
    lower: 206.23610252797255 },
  { middle: 208.81978963121128,
    upper: 212.39577230497775,
    lower: 205.2438069574448 },
  { middle: 207.7912382377626,
    upper: 211.12962264415242,
    lower: 204.45285383137278 },
  { middle: 206.62826316749948,
    upper: 209.9728091332503,
    lower: 203.28371720174866 },
  { middle: 205.71700000869,
    upper: 208.91909137786575,
    lower: 202.51490863951426 },
  { middle: 205.06490476976714,
    upper: 208.5477870020253,
    lower: 201.58202253750898 },
  { middle: 204.51872336312266,
    upper: 207.87631737215503,
    lower: 201.1611293540903 },
  { middle: 203.88836875711098,
    upper: 207.1502033652401,
    lower: 200.62653414898188 },
  { middle: 203.39995268500516,
    upper: 206.54260383232136,
    lower: 200.25730153768896 },
  { middle: 203.05614766738563,
    upper: 206.07453369997023,
    lower: 200.03776163480103 },
  { middle: 202.57080027049176,
    upper: 205.4833476998179,
    lower: 199.65825284116562 },
  { middle: 202.2078669113973,
    upper: 205.00615959779083,
    lower: 199.40957422500378 },
  { middle: 201.79759387221662,
    upper: 204.75405728997077,
    lower: 198.84113045446247 },
  { middle: 201.34829921771978,
    upper: 204.14911629369854,
    lower: 198.54748214174103 },
  { middle: 200.8713183398417,
    upper: 203.5770537082226,
    lower: 198.16558297146082 },
  { middle: 199.67595468842822,
    upper: 203.37511651997102,
    lower: 195.97679285688542 },
  { middle: 198.7477685276255,
    upper: 202.43401417601402,
    lower: 195.061522879237 },
  { middle: 198.07083819166118,
    upper: 201.68945927521085,
    lower: 194.4522171081115 },
  { middle: 197.53456788769344,
    upper: 200.92832686288813,
    lower: 194.14080891249876 },
  { middle: 197.15508523172264,
    upper: 200.53046830939786,
    lower: 193.7797021540474 },
  { middle: 196.82412473346332,
    upper: 200.060969503371,
    lower: 193.58727996355563 },
  { middle: 196.44277952075254,
    upper: 199.48393981366945,
    lower: 193.40161922783562 },
  { middle: 196.33870528068087,
    upper: 199.4867495443061,
    lower: 193.19066101705565 },
  { middle: 196.29597144442556,
    upper: 199.45921128168828,
    lower: 193.13273160716284 },
  { middle: 196.25064083067073,
    upper: 199.22255668420718,
    lower: 193.2787249771343 },
  { middle: 195.98677027536877,
    upper: 198.93149454355157,
    lower: 193.04204600718597 },
  { middle: 195.86898263009553,
    upper: 198.66523447146005,
    lower: 193.072730788731 },
  { middle: 195.72431761770548,
    upper: 198.41794427493355,
    lower: 193.03069096047741 },
  { middle: 195.6715254636383,
    upper: 198.26878945514355,
    lower: 193.07426147213303 },
  { middle: 195.65042780043467,
    upper: 198.1089653927894,
    lower: 193.19189020807994 },
  { middle: 195.55419658134565,
    upper: 197.8628804144649,
    lower: 193.2455127482264 },
  { middle: 195.62522547836036,
    upper: 198.0770409281677,
    lower: 193.17341002855304 },
  { middle: 195.66187067089746,
    upper: 197.96650457572406,
    lower: 193.35723676607086 },
  { middle: 195.4988353689072,
    upper: 197.84600588325114,
    lower: 193.15166485456328 },
  { middle: 195.3456129528208,
    upper: 197.54706641573034,
    lower: 193.14415948991126 },
  { middle: 195.34698314779024,
    upper: 197.48929126440885,
    lower: 193.20467503117163 },
  { middle: 195.3291752289531,
    upper: 197.3152525339098,
    lower: 193.34309792399637 }
];