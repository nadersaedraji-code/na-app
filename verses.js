// Translation by Talal Itani, ClearQuran.com (Allah edition), CC BY-ND 4.0.
// Verse translations are unmodified; the selection and order are specific to N&A.
const VERSES = [
  ["93:5", "Ad-Dhuhaa", "And your Lord will give you, and you will be satisfied."],
  ["2:152", "Al-Baqara", "So remember Me, and I will remember you. And thank Me, and do not be ungrateful."],
  ["29:69", "Al-Ankaboot", "As for those who strive for Us—We will guide them in Our ways. Allah is with the doers of good."],
  ["94:5", "Ash-Sharh", "With hardship comes ease."],
  ["3:139", "Aal-i-Imraan", "And do not waver, nor feel remorse. You are the superior ones, if you are believers."],
  ["55:13", "Ar-Rahmaan", "So which of your Lord’s marvels will you deny?"],
  ["20:114", "Taa-Haa", "Exalted is Allah, the True King. Do not be hasty with the Quran before its inspiration to you is concluded, and say, “My Lord, increase me in knowledge.”"],
  ["26:80", "Ash-Shu'araa", "And when I get sick, He heals me."],
  ["39:53", "Az-Zumar", "Say, “O My servants who have transgressed against themselves: do not despair of Allah’s mercy, for Allah forgives all sins. He is indeed the Forgiver, the Clement.”"],
  ["2:153", "Al-Baqara", "O you who believe! Seek help through patience and prayers. Allah is with the steadfast."],
  ["53:39", "An-Najm", "And that the human being attains only what he strives for."],
  ["54:17", "Al-Qamar", "We made the Quran easy to learn. Is there anyone who would learn?"],
  ["16:97", "An-Nahl", "Whoever works righteousness, whether male or female, while being a believer, We will grant him a good life—and We will reward them according to the best of what they used to do."],
  ["94:8", "Ash-Sharh", "And to your Lord turn for everything."],
  ["21:107", "Al-Anbiyaa", "We did not send you except as mercy to mankind."],
  ["87:14", "Al-A'laa", "Successful is he who purifies himself."],
  ["95:4", "At-Tin", "We created man in the best design."],
  ["2:186", "Al-Baqara", "And when My servants ask you about Me, I Am near; I answer the call of the caller when he calls on Me. So let them answer Me, and have faith in Me, that they may be rightly guided."],
  ["112:2", "Al-Ikhlaas", "Allah, the Absolute."],
  ["40:60", "Al-Ghaafir", "Your Lord has said, “Pray to Me, and I will respond to you. But those who are too proud to worship Me will enter Hell forcibly.”"],
  ["14:7", "Ibrahim", "And when your Lord proclaimed: “If you give thanks, I will grant you increase; but if you are ungrateful, My punishment is severe.”"],
  ["65:3", "At-Talaaq", "And will provide for him from where he never expected. Whoever relies on Allah—He will suffice him. Allah will accomplish His purpose. Allah has set a measure to all things."],
  ["1:6", "Al-Faatiha", "Guide us to the straight path."],
];

export function dailyVerse(day) {
  // Use a calendar date so DST and New Year cannot skip a verse.
  const days = (Date.parse(day) - Date.UTC(2026, 10, 24)) / 86_400_000;
  const index = ((days % VERSES.length) + VERSES.length) % VERSES.length;
  return VERSES[index];
}
