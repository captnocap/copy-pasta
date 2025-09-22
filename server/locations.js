const uspsDropOffLocations = [
  {
    type: "bluebox",
    address: "1812 SW 10TH AVE, PORTLAND, OR 97201",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "1101 SW MARKET ST, PORTLAND, OR 97201",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "1721 SW BROADWAY, PORTLAND, OR 97201",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "1010 SW JEFFERSON ST, PORTLAND, OR 97201",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "616 SW COLLEGE ST, PORTLAND, OR 97201",
    collectionTime: "12:00 pm"
  },
  {
    type: "bluebox",
    address: "1600 SW MONTGOMERY ST, PORTLAND, OR 97201",
    collectionTime: "12:00 pm"
  },
  {
    type: "bluebox",
    address: "1300 SW 5TH AVE, PORTLAND, OR 97201",
    collectionTime: "12:00 pm"
  },
  {
    type: "bluebox",
    address: "200 SW MARKET ST, PORTLAND, OR 97201",
    collectionTime: "5:00 pm"
  },
  {
    type: "bluebox",
    address: "2110 SW 5TH AVE, PORTLAND, OR 97201",
    collectionTime: "12:00 pm"
  },
  {
    type: "bluebox",
    address: "1414 SW 3RD AVE, PORTLAND, OR 97201",
    collectionTime: "5:00 pm"
  },
  {
    type: "bluebox",
    address: "1600 SW JEFFERSON ST, PORTLAND, OR 97201",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "1808 SW MARKET ST, PORTLAND, OR 97201",
    collectionTime: "12:00 pm"
  },
  {
    type: "bluebox",
    address: "2075 SW 1ST AVE, PORTLAND, OR 97201",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "2525 SW 1ST AVE, PORTLAND, OR 97201",
    collectionTime: "12:00 pm"
  },
  {
    type: "bluebox",
    address: "2020 SW 4TH AVE, PORTLAND, OR 97201",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "1200 SW JEFFERSON ST, PORTLAND, OR 97201",
    collectionTime: "1:00 pm"
  },
  {
    type: "bluebox",
    address: "1900 SW VISTA AVE, PORTLAND, OR 97201",
    collectionTime: "1:30 pm"
  },
  {
    type: "bluebox",
    address: "2200 SW 1ST AVE, PORTLAND, OR 97201",
    collectionTime: "12:00 pm"
  },
  {
    type: "bluebox",
    address: "1505 SW BROADWAY, PORTLAND, OR 97201",
    collectionTime: "12:00 pm"
  },
  {
    type: "bluebox",
    address: "1618 SW 1ST AVE, PORTLAND, OR 97201",
    collectionTime: "5:00 pm"
  },
  {
    type: "postoffice",
    address: "2300 SW 6TH AVE, PORTLAND, OR 97201-4915",
    collectionTime: "Not available"
  },
  {
    type: "bluebox",
    address: "1800 SW 1ST AVE, PORTLAND, OR 97201",
    collectionTime: "5:00 pm"
  },
  {
    type: "bluebox",
    address: "1305 SW 1ST AVE, PORTLAND, OR 97201",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "969 SW BROADWAY, PORTLAND, OR 97205",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "900 SW ALDER ST, PORTLAND, OR 97205",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "837 SW 11TH AVE, PORTLAND, OR 97205",
    collectionTime: "1:00 pm"
  },
  {
    type: "bluebox",
    address: "1600 SW MORRISON, PORTLAND, OR 97205",
    collectionTime: "1:00 pm"
  },
  {
    type: "bluebox",
    address: "101 SW MADISON ST, PORTLAND, OR 97204",
    collectionTime: "6:00 pm"
  },
  {
    type: "postoffice",
    address: "101 SW MADISON ST, PORTLAND, OR 97204-3264",
    collectionTime: "6:00 pm"
  },
  {
    type: "bluebox",
    address: "909 SW 16TH AVE, PORTLAND, OR 97205",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "300 SW YAMHILL ST, PORTLAND, OR 97204",
    collectionTime: "2:00 pm"
  },
  {
    type: "bluebox",
    address: "600 SW 10TH AVE, PORTLAND, OR 97205",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "603 SW BROADWAY, PORTLAND, OR 97205",
    collectionTime: "1:00 pm"
  },
  {
    type: "bluebox",
    address: "2545 SW TERWILLIGER BLVD, PORTLAND, OR 97201",
    collectionTime: "1:00 pm"
  },
  {
    type: "bluebox",
    address: "1849 SW SALMON ST, PORTLAND, OR 97205",
    collectionTime: "5:00 pm"
  },
  {
    type: "bluebox",
    address: "837 SW 1ST AVE, PORTLAND, OR 97204",
    collectionTime: "2:00 pm"
  },
  {
    type: "bluebox",
    address: "507 SW BROADWAY, PORTLAND, OR 97205",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "935 SW WASHINGTON ST, PORTLAND, OR 97205",
    collectionTime: "1:00 pm"
  },
  {
    type: "bluebox",
    address: "530 SW 5TH AVE, PORTLAND, OR 97204",
    collectionTime: "3:00 pm"
  },
  {
    type: "bluebox",
    address: "604 SW WASHINGTON, PORTLAND, OR 97204",
    collectionTime: "9:30 am"
  },
  {
    type: "bluebox",
    address: "601 SW 2ND AVE, PORTLAND, OR 97204",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "111 SW OAK ST, PORTLAND, OR 97204",
    collectionTime: "11:30 am"
  },
  {
    type: "bluebox",
    address: "220 SW OAK ST, PORTLAND, OR 97204",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "101 SW MADISON ST, PORTLAND, OR 97204",
    collectionTime: "6:00 pm"
  },
  {
    type: "bluebox",
    address: "300 SW WASHINGTON ST, PORTLAND, OR 97204",
    collectionTime: "11:30 am"
  },
  {
    type: "bluebox",
    address: "401 SW 5TH AVE, PORTLAND, OR 97204",
    collectionTime: "1:00 pm"
  },
  {
    type: "bluebox",
    address: "1120 NW COUCH ST, PORTLAND, OR 97209",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "204 SW 5TH AVE, PORTLAND, OR 97204",
    collectionTime: "4:30 pm"
  },
  {
    type: "bluebox",
    address: "421 SW OAK, PORTLAND, OR 97204",
    collectionTime: "1:00 pm"
  },
  {
    type: "bluebox",
    address: "204 SW 5TH AVE, PORTLAND, OR 97240",
    collectionTime: "5:00 pm"
  },
  {
    type: "postoffice",
    address: "204 SW 5TH AVE, PORTLAND, OR 97240-5000",
    collectionTime: "5:00 pm"
  },
  {
    type: "bluebox",
    address: "3101 SW SAM JACKSON PARK RD, PORTLAND, OR 97201",
    collectionTime: "3:00 pm"
  },
  {
    type: "bluebox",
    address: "2340 W BURNSIDE ST, PORTLAND, OR 97210",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "434 NW 19TH AVE, PORTLAND, OR 97209",
    collectionTime: "1:00 pm"
  },
  {
    type: "bluebox",
    address: "3181 SW SAM JACKSON PARK RD, PORTLAND, OR 97239",
    collectionTime: "3:00 pm"
  },
  {
    type: "bluebox",
    address: "222 NW DAVIS ST, PORTLAND, OR 97209",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "110 NW 2ND AVE, PORTLAND, OR 97209",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "745 NW HOYT ST, PORTLAND, OR 97208",
    collectionTime: "6:30 pm"
  },
  {
    type: "bluebox",
    address: "745 NW HOYT ST, PORTLAND, OR 97208",
    collectionTime: "6:00 pm"
  },
  {
    type: "bluebox",
    address: "745 NW HOYT ST, PORTLAND, OR 97208",
    collectionTime: "6:00 pm"
  },
  {
    type: "bluebox",
    address: "745 NW HOYT ST, PORTLAND, OR 97208",
    collectionTime: "6:00 pm"
  },
  {
    type: "postoffice",
    address: "745 NW HOYT ST, PORTLAND, OR 97208-8098",
    collectionTime: "6:30 pm"
  },
  {
    type: "bluebox",
    address: "500 NW FLANDERS ST, PORTLAND, OR 97209",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "800 NW 6TH AVE, PORTLAND, OR 97209",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "515 NW 10TH AVE, PORTLAND, OR 97209",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "1400 NW NORTHRUP ST, PORTLAND, OR 97209",
    collectionTime: "2:00 pm"
  },
  {
    type: "bluebox",
    address: "1400 NW GLISAN ST, PORTLAND, OR 97209",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "526 NW 21ST AVE, PORTLAND, OR 97209",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "2100 W BURNSIDE ST, PORTLAND, OR 97209",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "2078 NW FRONT AV, PORTLAND, OR 97209",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "1400 NW JOHNSON ST, PORTLAND, OR 97209",
    collectionTime: "1:00 pm"
  },
  {
    type: "bluebox",
    address: "707 SW GAINES ST, PORTLAND, OR 97239",
    collectionTime: "12:00 pm"
  },
  {
    type: "bluebox",
    address: "1900 NW KEARNEY ST, PORTLAND, OR 97209",
    collectionTime: "2:00 pm"
  },
  {
    type: "bluebox",
    address: "2300 NW IRVING ST, PORTLAND, OR 97210",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "1240 SE GRAND AVE, PORTLAND, OR 97214",
    collectionTime: "10:30 am"
  },
  {
    type: "bluebox",
    address: "301 SE PINE, PORTLAND, OR 97214",
    collectionTime: "12:30 pm"
  },
  {
    type: "bluebox",
    address: "2200 NW LOVEJOY ST, PORTLAND, OR 97210",
    collectionTime: "2:00 pm"
  },
  {
    type: "bluebox",
    address: "3550 SW BOND AVE, PORTLAND, OR 97239",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "6335 SW CAPITOL HWY, PORTLAND, OR 97239",
    collectionTime: "2:00 pm"
  },
  {
    type: "bluebox",
    address: "3338 SW CORBETT AVE, PORTLAND, OR 97239",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "0680 SW BANCROFT ST, PORTLAND, OR 97239",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "4380 SW MACADAM AVE, PORTLAND, OR 97239",
    collectionTime: "12:00 pm"
  },
  {
    type: "bluebox",
    address: "5331 SW MACADAM AVE, PORTLAND, OR 97239",
    collectionTime: "5:00 pm"
  },
  {
    type: "bluebox",
    address: "6420 SW MACADAM AVE, PORTLAND, OR 97239",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "4650 SW MACADAM AVE, PORTLAND, OR 97239",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "1020 SE 7TH AVE, PORTLAND, OR 97214",
    collectionTime: "5:00 pm"
  },
  {
    type: "bluebox",
    address: "1020 SE 7TH AVE, PORTLAND, OR 97214",
    collectionTime: "5:00 pm"
  },
  {
    type: "bluebox",
    address: "1020 SE 7TH AVE, PORTLAND, OR 97214",
    collectionTime: "5:00 pm"
  },
  {
    type: "bluebox",
    address: "1200 NW NAITO PKWY, PORTLAND, OR 97209",
    collectionTime: "10:00 am"
  },
  {
    type: "postoffice",
    address: "1020 SE 7TH AVE, PORTLAND, OR 97214-2387",
    collectionTime: "5:00 pm"
  },
  {
    type: "bluebox",
    address: "4001 SW CANYON RD, PORTLAND, OR 97221",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "819 SE MORRISON ST, PORTLAND, OR 97214",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "540 SE MORRISON ST, PORTLAND, OR 97214",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "2136 SE 8TH AVE, PORTLAND, OR 97214",
    collectionTime: "12:30 pm"
  },
  {
    type: "bluebox",
    address: "1100 SE HARRISON ST, PORTLAND, OR 97214",
    collectionTime: "2:00 pm"
  },
  {
    type: "bluebox",
    address: "1239 SE 12TH AVE, PORTLAND, OR 97214",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "1537 SE MORRISON ST, PORTLAND, OR 97214",
    collectionTime: "11:30 am"
  },
  {
    type: "bluebox",
    address: "1101 SE 23RD AVE, PORTLAND, OR 97214",
    collectionTime: "1:30 pm"
  },
  {
    type: "bluebox",
    address: "2429 SE HARRISON ST, PORTLAND, OR 97214",
    collectionTime: "2:30 pm"
  },
  {
    type: "bluebox",
    address: "1941 SE 30TH AVE, PORTLAND, OR 97214",
    collectionTime: "2:30 pm"
  },
  {
    type: "bluebox",
    address: "3701 SE GRANT ST, PORTLAND, OR 97214",
    collectionTime: "1:30 pm"
  },
  {
    type: "bluebox",
    address: "1112 SE 41ST AVE, PORTLAND, OR 97214",
    collectionTime: "1:30 pm"
  },
  {
    type: "bluebox",
    address: "1302 SE BIRCH ST, PORTLAND, OR 97214",
    collectionTime: "10:30 am"
  },
  {
    type: "bluebox",
    address: "815 SE OAK ST, PORTLAND, OR 97214",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "1721 SE HAWTHORNE BLVD, PORTLAND, OR 97214",
    collectionTime: "2:30 pm"
  },
  {
    type: "bluebox",
    address: "2205 E BURNSIDE ST, PORTLAND, OR 97214",
    collectionTime: "1:00 pm"
  },
  {
    type: "bluebox",
    address: "3155 E BURNSIDE ST, PORTLAND, OR 97214",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "501 SE 14TH AVE, PORTLAND, OR 97214",
    collectionTime: "12:30 pm"
  },
  {
    type: "bluebox",
    address: "3010 SE BELMONT ST, PORTLAND, OR 97214",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "1500 SE 35TH AVE, PORTLAND, OR 97214",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "800 E BURNSIDE ST, PORTLAND, OR 97214",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "1750 NW NAITO PKWY, PORTLAND, OR 97209",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "850 NE DAVIS ST, PORTLAND, OR 97232",
    collectionTime: "3:00 pm"
  },
  {
    type: "bluebox",
    address: "1805 NW 21ST AVE, PORTLAND, OR 97209",
    collectionTime: "2:45 pm"
  },
  {
    type: "bluebox",
    address: "1137 NW 23RD AVE, PORTLAND, OR 97210",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "3950 NW YEON AVE, PORTLAND, OR 97210",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "2200 NW OVERTON ST, PORTLAND, OR 97210",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "2800 NW WESTOVER RD, PORTLAND, OR 97210",
    collectionTime: "1:00 pm"
  },
  {
    type: "bluebox",
    address: "1827 NW 32ND AVE, PORTLAND, OR 97210",
    collectionTime: "12:00 pm"
  },
  {
    type: "bluebox",
    address: "2385 NW WESTOVER RD, PORTLAND, OR 97210",
    collectionTime: "10:30 am"
  },
  {
    type: "bluebox",
    address: "404 NW 23RD AVE, PORTLAND, OR 97210",
    collectionTime: "12:00 pm"
  },
  {
    type: "bluebox",
    address: "3271 NW 29TH AVE, PORTLAND, OR 97210",
    collectionTime: "11:00 am"
  },
  {
    type: "bluebox",
    address: "2017 NW VAUGHN ST, PORTLAND, OR 97209",
    collectionTime: "5:00 pm"
  },
  {
    type: "postoffice",
    address: "2017 NW VAUGHN ST, PORTLAND, OR 97209-1815",
    collectionTime: "5:00 pm"
  },
  {
    type: "bluebox",
    address: "3230 SE MILWAUKIE AVE, PORTLAND, OR 97202",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "700 NE MULTNOMAH ST, PORTLAND, OR 97232",
    collectionTime: "4:45 pm"
  },
  {
    type: "postoffice",
    address: "1410 SE POWELL BLVD, PORTLAND, OR 97202-2398",
    collectionTime: "5:00 pm"
  },
  {
    type: "bluebox",
    address: "5100 SW MACADAM AVE, PORTLAND, OR 97239",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "1410 SE POWELL BLVD, PORTLAND, OR 97242",
    collectionTime: "5:00 pm"
  },
  {
    type: "bluebox",
    address: "1410 SE POWELL BLVD, PORTLAND, OR 97202",
    collectionTime: "5:00 pm"
  },
  {
    type: "bluebox",
    address: "2701 NW VAUGHN ST, PORTLAND, OR 97210",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "1201 NE LLOYD BLVD, PORTLAND, OR 97232",
    collectionTime: "2:00 pm"
  },
  {
    type: "bluebox",
    address: "1009 SE BUSH ST, PORTLAND, OR 97202",
    collectionTime: "2:00 pm"
  },
  {
    type: "bluebox",
    address: "8000 SE 13TH AVE, PORTLAND, OR 97202",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "7900 SE MILWAUKIE AVE, PORTLAND, OR 97202",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "1425 NE IRVING ST, PORTLAND, OR 97232",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "5300 SW LANDING SQ, PORTLAND, OR 97239",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "2100 SE DIVISION ST, PORTLAND, OR 97202",
    collectionTime: "12:00 pm"
  },
  {
    type: "bluebox",
    address: "3962 SE HAWTHORNE BLVD, PORTLAND, OR 97214",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "815 NE SCHUYLER ST, PORTLAND, OR 97212",
    collectionTime: "5:00 pm"
  },
  {
    type: "bluebox",
    address: "815 NE SCHUYLER ST, PORTLAND, OR 97212",
    collectionTime: "5:15 pm"
  },
  {
    type: "bluebox",
    address: "815 NE SCHUYLER ST, PORTLAND, OR 97212",
    collectionTime: "5:15 pm"
  },
  {
    type: "postoffice",
    address: "815 NE SCHUYLER ST, PORTLAND, OR 97212-4039",
    collectionTime: "5:00 pm"
  },
  {
    type: "bluebox",
    address: "620 NE 19TH AVE, PORTLAND, OR 97232",
    collectionTime: "3:00 pm"
  },
  {
    type: "bluebox",
    address: "620 NE 19TH AVE, PORTLAND, OR 97232",
    collectionTime: "3:00 pm"
  },
  {
    type: "bluebox",
    address: "2801 N GANTENBEIN AVE, PORTLAND, OR 97227",
    collectionTime: "2:00 pm"
  },
  {
    type: "bluebox",
    address: "2701 SE 26TH AVE, PORTLAND, OR 97202",
    collectionTime: "1:30 pm"
  },
  {
    type: "bluebox",
    address: "3550 N INTERSTATE AVE, PORTLAND, OR 97227",
    collectionTime: "8:30 am"
  },
  {
    type: "bluebox",
    address: "700 NE KNOTT ST, PORTLAND, OR 97212",
    collectionTime: "11:00 am"
  },
  {
    type: "bluebox",
    address: "4035 SE 22ND AVE, PORTLAND, OR 97202",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "1438 NE 21ST AVE, PORTLAND, OR 97232",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "1831 NE BROADWAY ST, PORTLAND, OR 97232",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "901 NE GLISAN ST, PORTLAND, OR 97232",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "2173 NE BROADWAY ST, PORTLAND, OR 97232",
    collectionTime: "3:00 pm"
  },
  {
    type: "bluebox",
    address: "3136 NE BROADWAY ST, PORTLAND, OR 97232",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "3515 NE SANDY BLVD, PORTLAND, OR 97232",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "785 NE LAURELHURST PL, PORTLAND, OR 97232",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "3030 NE WEIDLER ST, PORTLAND, OR 97232",
    collectionTime: "1:00 pm"
  },
  {
    type: "bluebox",
    address: "400 NE 18TH AVE, PORTLAND, OR 97232",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "2838 E BURNSIDE ST, PORTLAND, OR 97214",
    collectionTime: "2:30 pm"
  },
  {
    type: "bluebox",
    address: "5319 SW WESTGATE DR, PORTLAND, OR 97221",
    collectionTime: "12:00 pm"
  },
  {
    type: "bluebox",
    address: "5201 SW WESTGATE DR, PORTLAND, OR 97221",
    collectionTime: "12:00 pm"
  },
  {
    type: "bluebox",
    address: "4000 N CONCORD AVE, PORTLAND, OR 97227",
    collectionTime: "12:00 pm"
  },
  {
    type: "bluebox",
    address: "6655 SW CAPITOL HWY, PORTLAND, OR 97239",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "815 NE SCHUYLER ST, PORTLAND, OR 97212",
    collectionTime: "5:15 pm"
  },
  {
    type: "bluebox",
    address: "2400 NE KLICKITAT ST, PORTLAND, OR 97212",
    collectionTime: "11:00 am"
  },
  {
    type: "bluebox",
    address: "2900 NE BRYCE ST, PORTLAND, OR 97212",
    collectionTime: "1:30 pm"
  },
  {
    type: "bluebox",
    address: "3839 NE TILLAMOOK ST, PORTLAND, OR 97212",
    collectionTime: "12:00 pm"
  },
  {
    type: "bluebox",
    address: "2800 SE GLADSTONE ST, PORTLAND, OR 97202",
    collectionTime: "1:30 pm"
  },
  {
    type: "bluebox",
    address: "3300 SE BROOKLYN ST, PORTLAND, OR 97202",
    collectionTime: "1:00 pm"
  },
  {
    type: "bluebox",
    address: "3551 SE DIVISION ST, PORTLAND, OR 97202",
    collectionTime: "12:00 pm"
  },
  {
    type: "bluebox",
    address: "2200 NE KNOTT ST, PORTLAND, OR 97212",
    collectionTime: "11:00 am"
  },
  {
    type: "bluebox",
    address: "5525 S.E MILWAUKIE AVE, PORTLAND, OR 97202",
    collectionTime: "2:00 pm"
  },
  {
    type: "bluebox",
    address: "3527 NE 15TH AVE, PORTLAND, OR 97212",
    collectionTime: "11:00 am"
  },
  {
    type: "bluebox",
    address: "3805 SE HAWTHORNE BLVD, PORTLAND, OR 97214",
    collectionTime: "5:00 pm"
  },
  {
    type: "bluebox",
    address: "4306 N WILLIAMS AVE, PORTLAND, OR 97217",
    collectionTime: "9:00 am"
  },
  {
    type: "bluebox",
    address: "3400 SE GLADSTONE ST, PORTLAND, OR 97202",
    collectionTime: "2:00 pm"
  },
  {
    type: "bluebox",
    address: "3300 SE HOLGATE BLVD, PORTLAND, OR 97202",
    collectionTime: "2:00 pm"
  },
  {
    type: "bluebox",
    address: "4407 SW VERMONT ST, PORTLAND, OR 97219",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "4000 SE BELMONT ST, PORTLAND, OR 97214",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "6411 SE MILWAUKIE AVE, PORTLAND, OR 97202",
    collectionTime: "1:15 pm"
  },
  {
    type: "bluebox",
    address: "4747 N CHANNEL AVE, PORTLAND, OR 97217",
    collectionTime: "11:00 am"
  },
  {
    type: "bluebox",
    address: "2800 NE STANTON ST, PORTLAND, OR 97212",
    collectionTime: "10:30 am"
  },
  {
    type: "bluebox",
    address: "6723 SE 16TH AVE, PORTLAND, OR 97282",
    collectionTime: "6:00 pm"
  },
  {
    type: "postoffice",
    address: "6723 SE 16TH AVE, PORTLAND, OR 97202-5706",
    collectionTime: "6:00 pm"
  },
  {
    type: "bluebox",
    address: "6723 SE 16TH AVE, PORTLAND, OR 97282",
    collectionTime: "6:00 pm"
  },
  {
    type: "bluebox",
    address: "6723 SE 16TH AVE, PORTLAND, OR 97202",
    collectionTime: "6:00 pm"
  },
  {
    type: "bluebox",
    address: "6723 SE 16TH AVE, PORTLAND, OR 97282",
    collectionTime: "5:30 pm"
  },
  {
    type: "bluebox",
    address: "8026 SW 10TH AVE, PORTLAND, OR 97219",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "6915 SW MACADAM AVE, PORTLAND, OR 97219",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "9320 SW BARBUR BLVD, PORTLAND, OR 97219",
    collectionTime: "3:00 pm"
  },
  {
    type: "bluebox",
    address: "4200 N MISSISSIPPI AVE, PORTLAND, OR 97217",
    collectionTime: "11:00 am"
  },
  {
    type: "bluebox",
    address: "1926 N KILLINGSWORTH ST, PORTLAND, OR 97217",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "8400 N CHAUTAUQUA BLVD, PORTLAND, OR 97217",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "2000 N ROSA PARKS WAY, PORTLAND, OR 97217",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "1736 N HAYDEN ISLAND DR, PORTLAND, OR 97217",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "700 N HAYDEN ISLAND DR, PORTLAND, OR 97217",
    collectionTime: "10:00 am"
  },
  {
    type: "bluebox",
    address: "6443 SW BEAVERTON HILLSDALE HWY, PORTLAND, OR 97221",
    collectionTime: "12:00 pm"
  },
  {
    type: "bluebox",
    address: "8200 SW BARBUR BLVD, PORTLAND, OR 97219",
    collectionTime: "10:00 am"
  }
]
module.exports = uspsDropOffLocations;