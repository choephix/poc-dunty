import { getRandomItemFrom } from "@sdk/helpers/arrays";

export module lipsum {
  export function line() {
    return getRandomItemFrom([
      "Lorem ipsum dolor sit amet",
      "Consectetuer adipiscing elit",
      "Donec odio",
      "Quisque volutpat mattis eros",
      "Nullam malesuada erat ut turpis",
      "Suspendisse urna nibh",
      "Viverra non",
      "Semper suscipit",
      "Posuere a",
      "Pede",
      "Donec nec justo",
      "Eget felis",
      "Facilisis fermentum",
      "Aliquam porttitor",
      "Mauris sit amet orci",
      "Aenean dignissim pellentesque felis",
      "Morbi in sem quis dui placerat ornare",
      "Praesent",
      "Pellentesque odio nisi",
      "Euismod in",
      "Pharetra a",
      "Ultricies in",
      "Diam",
      "Sed arcu",
      "Cras consequat",
      "Sit amet, nisi",
    ]);
  }

  const trainNames = ["awesometrain", "fantastictrain", "greattrain", "groovytrain", "cooltrain"];
  export function trainName() {
    return getRandomItemFrom(trainNames);
  }

  export const userNames = [
    "wxdm3rqb9vb9.wam",
    "cyjpf9rif0f6.wam",
    "zb6oznueriu7.wam",
    "de30x520rckp.wam",
    "eb7bx3gsunv0.wam",
    "aewvwy6ufn2o.wam",
    "5o90pxjhr1ai.wam",
    "xg1hxq0588ug.wam",
    "pqq3dn5v160y.wam",
    "kfwhf3lauzay.wam",
    "99w4d3fedz29.wam",
    "an718xm1sgai.wam",
    "ull8jilgb3rn.wam",
    "wftg2n54orqa.wam",
    "u7da8dp4orxb.wam",
    "u5524lh8yzx2.wam",
    "k0iky9agvesm.wam",
    "onwfbrcuzdha.wam",
    "lb2b3a2pvpxd.wam",
    "4im800owoz60.wam",
    "oalivpsthtm6.wam",
    "cfdjbvjbeno.wam",
    "pgcll9ubgf4.wam",
    "spopkhkwcyg.wam",
    "sc1kdlo40xp.wam",
    "njejsn27391.wam",
    "h1ekzu23kuj.wam",
    "loog8o5jzo.wam",
    "1kcnhezoz2.wam",
    "t2ne3fvnsm.wam",
    "92tiw9b20k.wam",
    "nphh98c340.wam",
    "gpvkuuyvd.wam",
    "54rugpf6o.wam",
    "zml9q7pxy.wam",
    "h25z16g.wam",
  ];
  export function userName() {
    return getRandomItemFrom(userNames);
  }
}
