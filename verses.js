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

// Romanian: Islam4ro.com, QuranEnc edition romanian_project v1.0.4.
// Arabic text, translations and footnotes are reproduced verbatim from QuranEnc.com.
const ORIGINAL_AND_ROMANIAN = {
  "93:5": ["Și Domnul tău îți va dărui și vei fi tu mulțumit!", "وَلَسَوۡفَ يُعۡطِيكَ رَبُّكَ فَتَرۡضَىٰٓ"],
  "2:152": ["Pomeniţi-Mă pe Mine şi o să vă pomenesc și Eu! Şi fiţi recunoscători față de Mine și nu fiţi fără credinţă faţă de Mine!", "فَٱذۡكُرُونِيٓ أَذۡكُرۡكُمۡ وَٱشۡكُرُواْ لِي وَلَا تَكۡفُرُونِ"],
  "29:69": ["Iar pe aceia care se străduiesc de dragul Nostru îi vom călăuzi pe căile Noastre, căci Allah este cu cei credincioși care fac bine.", "وَٱلَّذِينَ جَٰهَدُواْ فِينَا لَنَهۡدِيَنَّهُمۡ سُبُلَنَاۚ وَإِنَّ ٱللَّهَ لَمَعَ ٱلۡمُحۡسِنِينَ"],
  "94:5": ["Cu adevărat, alături de greu vine și ușorul.", "فَإِنَّ مَعَ ٱلۡعُسۡرِ يُسۡرًا"],
  "3:139": ["Nu fiți slabi și nici întristați, căci voi veți fi cei biruitori, dacă sunteți credincioși!", "وَلَا تَهِنُواْ وَلَا تَحۡزَنُواْ وَأَنتُمُ ٱلۡأَعۡلَوۡنَ إِن كُنتُم مُّؤۡمِنِينَ"],
  "55:13": ["Așadar, pe care dintre binefacerile Domnului vostru le tăgăduiți?", "فَبِأَيِّ ءَالَآءِ رَبِّكُمَا تُكَذِّبَانِ"],
  "20:114": ["Și mai presus [de toate] este Allah - Al-Malik [Regele], Al-Haqq [Adevărul]! Nu te grăbi [O, Mohammed] cu recitarea Coranului mai înainte de a ți se încheia revelarea lui! Și spune: „Doamne, sporește-mi mie știința.”", "فَتَعَٰلَى ٱللَّهُ ٱلۡمَلِكُ ٱلۡحَقُّۗ وَلَا تَعۡجَلۡ بِٱلۡقُرۡءَانِ مِن قَبۡلِ أَن يُقۡضَىٰٓ إِلَيۡكَ وَحۡيُهُۥۖ وَقُل رَّبِّ زِدۡنِي عِلۡمٗا"],
  "26:80": ["Iar când sunt bolnav, El mă vindecă,", "وَإِذَا مَرِضۡتُ فَهُوَ يَشۡفِينِ"],
  "39:53": ["Spune: „O, voi, robii Mei care ați întrecut măsura în defavoarea voastră, nu deznădăjduiți în privința Îndurării lui Allah.” Allah iartă toate păcatele[12]. Cu adevărat, El este Al-Ghafur [Iertător], Ar-Rahim [Îndurător].", "۞ قُلۡ يَٰعِبَادِيَ ٱلَّذِينَ أَسۡرَفُواْ عَلَىٰٓ أَنفُسِهِمۡ لَا تَقۡنَطُواْ مِن رَّحۡمَةِ ٱللَّهِۚ إِنَّ ٱللَّهَ يَغۡفِرُ ٱلذُّنُوبَ جَمِيعًاۚ إِنَّهُۥ هُوَ ٱلۡغَفُورُ ٱلرَّحِيمُ", "[12] Celor care se căiesc și se îndreaptă"],
  "2:153": ["O, voi, cei care credeţi! Căutaţi ajutor întru răbdare şi Rugăciune. Cu adevărat Allah este cu cei răbdători!", "يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُواْ ٱسۡتَعِينُواْ بِٱلصَّبۡرِ وَٱلصَّلَوٰةِۚ إِنَّ ٱللَّهَ مَعَ ٱلصَّٰبِرِينَ"],
  "53:39": ["Și că omul nu va dobândi decât [rodul] celor pe care le-a agonisit", "وَأَن لَّيۡسَ لِلۡإِنسَٰنِ إِلَّا مَا سَعَىٰ"],
  "54:17": ["Noi am făcut Coranul ușor, pentru îndemnare, dar oare se află cine să ia aminte?", "وَلَقَدۡ يَسَّرۡنَا ٱلۡقُرۡءَانَ لِلذِّكۡرِ فَهَلۡ مِن مُّدَّكِرٖ"],
  "16:97": ["Pe cel ce face o faptă bună - bărbat sau femeie - și este credincios îl vom dărui Noi cu o viață bună. Și Noi îi vom răsplăti pe ei după [faptele] cele mai bune pe care le-au săvârșit.", "مَنۡ عَمِلَ صَٰلِحٗا مِّن ذَكَرٍ أَوۡ أُنثَىٰ وَهُوَ مُؤۡمِنٞ فَلَنُحۡيِيَنَّهُۥ حَيَوٰةٗ طَيِّبَةٗۖ وَلَنَجۡزِيَنَّهُمۡ أَجۡرَهُم بِأَحۡسَنِ مَا كَانُواْ يَعۡمَلُونَ"],
  "94:8": ["Punându-ți [toată] speranța în Domnul tău!", "وَإِلَىٰ رَبِّكَ فَٱرۡغَب"],
  "21:107": ["Și Noi nu te-am trimis [o, Mohammed] decât ca o îndurare pentru lumi.", "وَمَآ أَرۡسَلۡنَٰكَ إِلَّا رَحۡمَةٗ لِّلۡعَٰلَمِينَ"],
  "87:14": ["Va izbândi cel ce se curățește [acceptând monoteismul]", "قَدۡ أَفۡلَحَ مَن تَزَكَّىٰ"],
  "95:4": ["Noi l-am creat pe om cu cea mai frumoasă înfățișare[2],", "لَقَدۡ خَلَقۡنَا ٱلۡإِنسَٰنَ فِيٓ أَحۡسَنِ تَقۡوِيمٖ", "[2] Într-o formă simetrică și echilibrată"],
  "2:186": ["Şi dacă te vor întreba robii Mei despre Mine [spune-le, o, Mohammed]: „Cu adevărat Eu sunt aproape, răspund rugii celor care Mă cheamă, atunci când Mă cheamă, dar şi ei să-Mi răspundă [prin ascultare] şi să creadă în Mine. Poate că ei vor fi bine călăuziţi!”", "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌۖ أُجِيبُ دَعۡوَةَ ٱلدَّاعِ إِذَا دَعَانِۖ فَلۡيَسۡتَجِيبُواْ لِي وَلۡيُؤۡمِنُواْ بِي لَعَلَّهُمۡ يَرۡشُدُونَ"],
  "112:2": ["Allah-us-Samad[2]!", "ٱللَّهُ ٱلصَّمَدُ", "[2] „Allah, Refugiul Etern” – care este căutat în timpuri dificile și la nevoie, de care depinde întreaga creație"],
  "40:60": ["Și Domnul vostru zice: „Chemați-Mă și Eu vă voi răspunde! Cei care din prea multă trufie refuză să Mă adore vor intra în Iad umiliți\".", "وَقَالَ رَبُّكُمُ ٱدۡعُونِيٓ أَسۡتَجِبۡ لَكُمۡۚ إِنَّ ٱلَّذِينَ يَسۡتَكۡبِرُونَ عَنۡ عِبَادَتِي سَيَدۡخُلُونَ جَهَنَّمَ دَاخِرِينَ"],
  "14:7": ["Și când Domnul vostru a vestit: „Dacă veți fi mulțumitori, vă voi înmulți [Binefacerile Mele], iar de veți fi nemulțumitori, pedeapsa Mea va fi aspră!”", "وَإِذۡ تَأَذَّنَ رَبُّكُمۡ لَئِن شَكَرۡتُمۡ لَأَزِيدَنَّكُمۡۖ وَلَئِن كَفَرۡتُمۡ إِنَّ عَذَابِي لَشَدِيدٞ"],
  "65:3": ["Și-l va înzestra pe el de unde el nici nu se așteaptă. Iar celui care se încrede în Allah, El îi este de ajuns, căci Allah împlinește lucrul Său și Allah a stabilit un termen pentru fiecare lucru.", "وَيَرۡزُقۡهُ مِنۡ حَيۡثُ لَا يَحۡتَسِبُۚ وَمَن يَتَوَكَّلۡ عَلَى ٱللَّهِ فَهُوَ حَسۡبُهُۥٓۚ إِنَّ ٱللَّهَ بَٰلِغُ أَمۡرِهِۦۚ قَدۡ جَعَلَ ٱللَّهُ لِكُلِّ شَيۡءٖ قَدۡرٗا"],
  "1:6": ["Călăuzește-ne pe noi către Calea cea Dreaptă[1],", "ٱهۡدِنَا ٱلصِّرَٰطَ ٱلۡمُسۡتَقِيمَ", "[1] Islamul"],
};

export function dailyVerse(day) {
  // Use a calendar date so DST and New Year cannot skip a verse.
  const days = (Date.parse(day) - Date.UTC(2026, 10, 24)) / 86_400_000;
  const index = ((days % VERSES.length) + VERSES.length) % VERSES.length;
  const [ref, surah, en] = VERSES[index];
  const [ro, ar, roFootnote = ''] = ORIGINAL_AND_ROMANIAN[ref];
  return { ref, surah, en, ro, ar, roFootnote };
}
