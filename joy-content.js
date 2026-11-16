/* ============================================================
   Halal Couple — the content.
   Everything here is original, modest and made for two people
   who want to grow closer to each other and to Allah.
   ============================================================ */

export const JOY_CATEGORIES = [
  { id: 'relationship', name: 'Relationship', emoji: '💞', tint: '#F8DCE7', ink: '#A62A54', sub: 'The two of you' },
  { id: 'deen', name: 'Deen', emoji: '🕌', tint: '#E2EFE6', ink: '#2F6B4F', sub: 'Faith and gratitude' },
  { id: 'home', name: 'Our home', emoji: '🏡', tint: '#F9E8D2', ink: '#8A5A2B', sub: 'The everyday' },
  { id: 'family', name: 'Family', emoji: '🌿', tint: '#E4F1EA', ink: '#2E6A5A', sub: 'Roots and kin' },
  { id: 'childhood', name: 'Childhood', emoji: '🧸', tint: '#F7E8D8', ink: '#9A5A35', sub: 'The stories that made you' },
  { id: 'dreams', name: 'Dreams', emoji: '🌙', tint: '#E9E4F6', ink: '#5D4B8A', sub: 'What you hope for' },
  { id: 'travel', name: 'Travel', emoji: '✈️', tint: '#DFEEF7', ink: '#2D6382', sub: 'Places and journeys' },
  { id: 'food', name: 'Food', emoji: '🍽️', tint: '#FBEBD9', ink: '#8B5A2B', sub: 'Comfort and cravings' },
  { id: 'fun', name: 'Little things', emoji: '🎈', tint: '#FBE3E0', ink: '#A9463E', sub: 'Silly and light' },
  { id: 'memories', name: 'Memories', emoji: '📸', tint: '#F3E7D9', ink: '#7A5632', sub: 'The days you keep' },
];

export const MOODS = [
  { id: 'grateful', emoji: '🤲', label: 'Grateful', tint: '#F3E7C9', ink: '#7A5A1F' },
  { id: 'happy', emoji: '😊', label: 'Happy', tint: '#FBE2D9', ink: '#A5482E' },
  { id: 'calm', emoji: '🌿', label: 'Calm', tint: '#E3F0E7', ink: '#2F6B4F' },
  { id: 'hopeful', emoji: '🌱', label: 'Hopeful', tint: '#E7F0DD', ink: '#4A6B2F' },
  { id: 'tired', emoji: '😴', label: 'Tired', tint: '#E9E4F2', ink: '#5D4B8A' },
  { id: 'missing', emoji: '🥺', label: 'Missing you', tint: '#F4DFE9', ink: '#9C3560' },
  { id: 'heavy', emoji: '🌧️', label: 'Heavy heart', tint: '#E2E8F0', ink: '#40546B' },
  { id: 'quiet', emoji: '🌙', label: 'Quiet', tint: '#E9E4F6', ink: '#5D4B8A' },
];

export const GAME_META = {
  wyr: {
    title: 'Would You Rather', emoji: '🤔', short: 'Two doors, one choice.',
    note: 'A little playful, a little revealing.', tint: '#F7DCE4', ink: '#8C2348', format: 'binary', size: 7,
  },
  wml: {
    title: 'Who’s More Likely?', emoji: '🫵', short: 'Point at each other — gently.',
    note: 'Both of you choose the same person. Or not.', tint: '#E6EFE7', ink: '#2F6B4F', format: 'people', size: 7,
  },
  nhie: {
    title: 'Never Have I Ever', emoji: '🙈', short: 'The wholesome edition.',
    note: 'No confessions, just little truths and laughs.', tint: '#F9E8CF', ink: '#8A5A2B', format: 'binary', size: 7,
  },
  thisthat: {
    title: 'This or That', emoji: '⚖️', short: 'Pick a side. Keep it honest.',
    note: 'The little choices that make up a life.', tint: '#DFEEF7', ink: '#2D6382', format: 'binary', size: 7,
  },
  deep: {
    title: 'Deep Talks', emoji: '🌙', short: 'For after Maghrib.',
    note: 'Slow questions for a quiet hour.', tint: '#E9E4F6', ink: '#5D4B8A', format: 'text', size: 7,
  },
  quiz: {
    title: 'Couple Quiz', emoji: '💡', short: 'How well do you know us?',
    note: 'Answer for yourself, then see the overlap.', tint: '#FBE3E0', ink: '#A9463E', format: 'choice', size: 8,
  },
  truthdare: {
    title: 'Truth or Dare', emoji: '✨', short: 'Soft truths, kind dares.',
    note: 'Nothing embarrassing. Only things that bring you closer.', tint: '#F3E7C9', ink: '#7A5A1F', format: 'text', size: 6,
  },
  photo: {
    title: 'Answer with a Photo', emoji: '📸', short: 'Show me, don’t tell me.',
    note: 'A little gallery of your everyday life.', tint: '#F3E7D9', ink: '#7A5632', format: 'photo', size: 5,
  },
};

/* ------------------------------------------------------------
   Daily questions — nine per category, rotating one category
   per day, then one step deeper into each category.
   ------------------------------------------------------------ */
export const DAILY_BY_CAT = {
  relationship: [
    { id: 'd001', type: 'choice', prompt: 'What makes you feel most loved by me?', options: ['A long hug', 'A thoughtful message', 'Uninterrupted time', 'Being listened to'] },
    { id: 'd002', type: 'text', prompt: 'When did you last feel truly seen by me?' },
    { id: 'd003', type: 'choice', prompt: 'What do we do best together?', options: ['Laugh', 'Dream', 'Build', 'Rest'] },
    { id: 'd004', type: 'text', prompt: 'What is one small thing I do that you hope I never stop doing?' },
    { id: 'd005', type: 'choice', prompt: 'How do you most like to reconnect after a disagreement?', options: ['A quiet walk', 'A warm hug', 'Talking it through', 'Time, then talking'] },
    { id: 'd006', type: 'text', prompt: 'What does “home” mean when it is a person, not a place?' },
    { id: 'd007', type: 'choice', prompt: 'Which promise matters most to you in a marriage?', options: ['Honesty', 'Patience', 'Loyalty', 'Tenderness'] },
    { id: 'd008', type: 'text', prompt: 'What is one way we have grown since we met?' },
    { id: 'd009', type: 'choice', prompt: 'What would you love more of this month?', options: ['Adventures', 'Quiet evenings', 'Deep talks', 'Playfulness'] },
  ],
  deen: [
    { id: 'd010', type: 'choice', prompt: 'Which part of the day feels most spiritual to you?', options: ['Fajr', 'After Asr', 'Maghrib', 'The quiet before sleep'] },
    { id: 'd011', type: 'text', prompt: 'What du’a do you find yourself repeating lately?' },
    { id: 'd012', type: 'choice', prompt: 'What helps you feel close to Allah?', options: ['Prayer', 'Qur’an', 'Nature', 'Gratitude'] },
    { id: 'd013', type: 'text', prompt: 'Which quality of the Prophet ﷺ do you most want to carry into our home?' },
    { id: 'd014', type: 'choice', prompt: 'What would you like us to grow together this year?', options: ['Qur’an reading', 'Sadaqah', 'Night prayer', 'Du’a for each other'] },
    { id: 'd015', type: 'text', prompt: 'What is one blessing you want us to thank Allah for more often?' },
    { id: 'd016', type: 'choice', prompt: 'How do you like to be reminded of something good?', options: ['Gently, with love', 'With a verse', 'With a story', 'With a practical plan'] },
    { id: 'd017', type: 'text', prompt: 'What does a peaceful Islamic home look like to you?' },
    { id: 'd018', type: 'choice', prompt: 'Which name of Allah comforts you most?', options: ['Ar-Rahman', 'Al-Wadud', 'As-Samee’', 'Al-Lateef'] },
  ],
  home: [
    { id: 'd019', type: 'text', prompt: 'What corner of our home feels most like us?' },
    { id: 'd020', type: 'choice', prompt: 'What is your ideal Friday evening at home?', options: ['A slow meal', 'A film under a blanket', 'Tea and talking', 'Early sleep, early Fajr'] },
    { id: 'd021', type: 'text', prompt: 'What is one habit you would love us to build at home?' },
    { id: 'd022', type: 'choice', prompt: 'Which little thing makes a house feel warm?', options: ['Fresh bread', 'Clean sheets', 'Soft light', 'A full fruit bowl'] },
    { id: 'd023', type: 'text', prompt: 'What does “taking care of each other” look like on an ordinary day?' },
    { id: 'd024', type: 'choice', prompt: 'How should we divide the quiet work of home?', options: ['By energy', 'By schedule', 'Together, side by side', 'Take turns'] },
    { id: 'd025', type: 'text', prompt: 'What is one thing in our home you want to change together?' },
    { id: 'd026', type: 'choice', prompt: 'What would make our mornings gentler?', options: ['An earlier night', 'Prepared breakfast', 'A shared du’a', 'No phones for ten minutes'] },
    { id: 'd027', type: 'text', prompt: 'Describe your favourite ordinary evening with me.' },
  ],
  family: [
    { id: 'd028', type: 'text', prompt: 'What did your family teach you about love that you want to keep?' },
    { id: 'd029', type: 'choice', prompt: 'What is the best way to care for our parents as they grow older?', options: ['Time', 'Patience', 'Practical help', 'Du’a'] },
    { id: 'd030', type: 'text', prompt: 'What would you like our future children to remember about us?' },
    { id: 'd031', type: 'choice', prompt: 'Which family tradition would you love to start?', options: ['Friday breakfast', 'A monthly visit', 'A yearly trip', 'A gratitude jar'] },
    { id: 'd032', type: 'text', prompt: 'Who in your family shaped your idea of a good marriage?' },
    { id: 'd033', type: 'choice', prompt: 'How do you prefer we handle family plans?', options: ['Decide together', 'Ask each other first', 'Keep it simple', 'Make a calendar'] },
    { id: 'd034', type: 'text', prompt: 'What is one boundary you think would protect our little family?' },
    { id: 'd035', type: 'choice', prompt: 'What is your favourite way to show respect to elders?', options: ['Listening', 'Visiting', 'Helping', 'Remembering them in du’a'] },
    { id: 'd036', type: 'text', prompt: 'What do you hope our family table feels like?' },
  ],
  childhood: [
    { id: 'd037', type: 'text', prompt: 'What is your happiest childhood memory?' },
    { id: 'd038', type: 'choice', prompt: 'What did you love most as a child?', options: ['Being outdoors', 'Making things', 'Stories', 'Being with cousins'] },
    { id: 'd039', type: 'text', prompt: 'What did you believe about love when you were small?' },
    { id: 'd040', type: 'choice', prompt: 'Which childhood treat still comforts you?', options: ['A warm pastry', 'Sweet tea', 'Fresh fruit', 'A homemade dish'] },
    { id: 'd041', type: 'text', prompt: 'What is something you wish you had been told as a child?' },
    { id: 'd042', type: 'choice', prompt: 'What kind of child were you?', options: ['Curious', 'Quiet', 'Mischievous', 'A helper'] },
    { id: 'd043', type: 'text', prompt: 'Which place from your childhood would you love to show me?' },
    { id: 'd044', type: 'choice', prompt: 'What made you feel safe as a child?', options: ['A parent’s voice', 'A routine', 'A favourite blanket', 'Knowing you were wanted'] },
    { id: 'd045', type: 'text', prompt: 'What is a small childhood joy you still carry?' },
  ],
  dreams: [
    { id: 'd046', type: 'text', prompt: 'What is one dream you have not said out loud yet?' },
    { id: 'd047', type: 'choice', prompt: 'What kind of life do you picture for us in ten years?', options: ['A quiet home', 'A busy family', 'A life of travel', 'A life of service'] },
    { id: 'd048', type: 'text', prompt: 'What would you attempt if you knew we would catch each other?' },
    { id: 'd049', type: 'choice', prompt: 'What do you want more of in our future?', options: ['Peace', 'Adventure', 'Purpose', 'Presence'] },
    { id: 'd050', type: 'text', prompt: 'What is a skill you would love to learn together?' },
    { id: 'd051', type: 'choice', prompt: 'Which dream feels closest right now?', options: ['A home', 'A journey', 'A child', 'A project'] },
    { id: 'd052', type: 'text', prompt: 'What does a good life look like when you strip away what others expect?' },
    { id: 'd053', type: 'choice', prompt: 'How do you like to be supported in a big dream?', options: ['Believe in me', 'Make a plan', 'Give me space', 'Cheer loudly'] },
    { id: 'd054', type: 'text', prompt: 'What is one thing you hope we do before we grow old?' },
  ],
  travel: [
    { id: 'd055', type: 'choice', prompt: 'What kind of journey sounds most like us?', options: ['A quiet coast', 'A busy city', 'A mountain road', 'A desert sky'] },
    { id: 'd056', type: 'text', prompt: 'Which place have you always wanted to see with me?' },
    { id: 'd057', type: 'choice', prompt: 'What is your ideal travel pace?', options: ['Slow and open', 'A full itinerary', 'One place, deeply', 'Follow the food'] },
    { id: 'd058', type: 'text', prompt: 'What is the best trip you have ever taken?' },
    { id: 'd059', type: 'choice', prompt: 'What matters most in a hotel?', options: ['A view', 'A comfortable bed', 'A good breakfast', 'A quiet street'] },
    { id: 'd060', type: 'text', prompt: 'If we could leave tomorrow with no obligations, where would we go?' },
    { id: 'd061', type: 'choice', prompt: 'Which travel memory do you want us to recreate?', options: ['A sunrise', 'A long walk', 'A shared meal', 'A night under stars'] },
    { id: 'd062', type: 'text', prompt: 'What does travelling with me teach you about us?' },
    { id: 'd063', type: 'choice', prompt: 'What should we always carry on a trip?', options: ['A camera', 'A flask of tea', 'A plan', 'A little patience'] },
  ],
  food: [
    { id: 'd064', type: 'choice', prompt: 'What is your comfort meal?', options: ['Soup', 'Rice and stew', 'Bread and cheese', 'Something sweet'] },
    { id: 'd065', type: 'text', prompt: 'What is a meal that tastes like home to you?' },
    { id: 'd066', type: 'choice', prompt: 'How do you like to eat together?', options: ['At the table', 'On the sofa', 'Anywhere, as long as it’s us', 'While talking for hours'] },
    { id: 'd067', type: 'text', prompt: 'What is one dish you would love us to learn together?' },
    { id: 'd068', type: 'choice', prompt: 'What is the best kind of date?', options: ['A quiet restaurant', 'A home-cooked meal', 'Street food', 'A picnic'] },
    { id: 'd069', type: 'text', prompt: 'What food reminds you of your mother or father?' },
    { id: 'd070', type: 'choice', prompt: 'How do you take your tea?', options: ['Sweet and strong', 'Milk, no sugar', 'Green', 'I’m a coffee person'] },
    { id: 'd071', type: 'text', prompt: 'What is one small food tradition you want to keep in our home?' },
    { id: 'd072', type: 'choice', prompt: 'What would you cook for me to say “I love you”?', options: ['Breakfast', 'A slow dinner', 'Dessert', 'Something from your childhood'] },
  ],
  fun: [
    { id: 'd073', type: 'text', prompt: 'What is the silliest thing that made you laugh recently?' },
    { id: 'd074', type: 'choice', prompt: 'What is your favourite kind of playful evening?', options: ['A board game', 'A ridiculous film', 'A walk with no plan', 'Cooking something new'] },
    { id: 'd075', type: 'text', prompt: 'What is one inside joke you hope we still have when we are old?' },
    { id: 'd076', type: 'choice', prompt: 'Who is more likely to start a food fight?', options: ['Me', 'You', 'Both of us', 'The children, one day'] },
    { id: 'd077', type: 'text', prompt: 'What ridiculous phrase would be our family motto?' },
    { id: 'd078', type: 'choice', prompt: 'What is your favourite way to be teased?', options: ['A nickname', 'A dramatic impression', 'A knowing look', 'A playful debate'] },
    { id: 'd079', type: 'text', prompt: 'What is the most ridiculous thing you have ever done for love?' },
    { id: 'd080', type: 'choice', prompt: 'What superpower would you waste on something tiny?', options: ['Flying to the kitchen', 'Teleporting to the sofa', 'Talking to cats', 'Never losing socks'] },
    { id: 'd081', type: 'text', prompt: 'What is one thing we should do just because it makes us laugh?' },
  ],
  memories: [
    { id: 'd082', type: 'text', prompt: 'What is your favourite memory of us?' },
    { id: 'd083', type: 'choice', prompt: 'Which sense brings us back fastest?', options: ['A photograph', 'A scent', 'A taste', 'The way the light falls'] },
    { id: 'd084', type: 'text', prompt: 'What was the moment you knew you could trust me?' },
    { id: 'd085', type: 'choice', prompt: 'Which memory would you relive tonight?', options: ['Our first meeting', 'Our first trip', 'An ordinary day', 'The hardest day we survived'] },
    { id: 'd086', type: 'text', prompt: 'What is a small moment between us that you never told me you treasured?' },
    { id: 'd087', type: 'choice', prompt: 'How do you like to keep memories?', options: ['Photos', 'Words', 'Little objects', 'In stories we tell'] },
    { id: 'd088', type: 'text', prompt: 'What is one memory you hope we make this year?' },
    { id: 'd089', type: 'choice', prompt: 'Which of our photos deserves a frame?', options: ['The laughing one', 'The quiet one', 'The one from a journey', 'One we haven’t taken yet'] },
    { id: 'd090', type: 'text', prompt: 'What do you want us to remember about this season of our life?' },
  ],
};

export const DAILY_QUESTIONS = Object.values(DAILY_BY_CAT).flat();

/** The same question on both phones, with a category that rotates daily. */
export function dailyQuestionFor(day) {
  const cats = JOY_CATEGORIES.map((c) => c.id);
  const n = Math.floor(Date.parse(`${day}T12:00:00Z`) / 86400000);
  const cat = cats[((n % cats.length) + cats.length) % cats.length];
  const pool = DAILY_BY_CAT[cat] || DAILY_QUESTIONS;
  const round = Math.floor(n / cats.length);
  return pool[((round % pool.length) + pool.length) % pool.length];
}

/* ------------------------------------------------------------
   Would You Rather
   ------------------------------------------------------------ */
export const WYR = [
  { id: 'wyr01', a: { text: 'A quiet cabin in the mountains', emoji: '🏔️' }, b: { text: 'A small room by the sea', emoji: '🌊' } },
  { id: 'wyr02', a: { text: 'Wake for Fajr, then sleep again', emoji: '🌅' }, b: { text: 'Stay up talking until Fajr', emoji: '🌙' } },
  { id: 'wyr03', a: { text: 'A perfectly planned date', emoji: '🗓️' }, b: { text: 'A day with no plan at all', emoji: '🍃' } },
  { id: 'wyr04', a: { text: 'Live near family', emoji: '🏡' }, b: { text: 'Live somewhere new', emoji: '🧭' } },
  { id: 'wyr05', a: { text: 'A home full of books', emoji: '📚' }, b: { text: 'A home full of plants', emoji: '🪴' } },
  { id: 'wyr06', a: { text: 'A month of travel', emoji: '✈️' }, b: { text: 'A year of slow weekends', emoji: '☕' } },
  { id: 'wyr07', a: { text: 'Always know what I’m thinking', emoji: '💭' }, b: { text: 'Never surprise each other', emoji: '🎁' } },
  { id: 'wyr08', a: { text: 'A tiny home, beautifully made', emoji: '🕯️' }, b: { text: 'A big home, slowly filled', emoji: '🛋️' } },
  { id: 'wyr09', a: { text: 'Tea in a quiet garden', emoji: '🍵' }, b: { text: 'Coffee on a busy street', emoji: '☕' } },
  { id: 'wyr10', a: { text: 'A life of routine', emoji: '🕰️' }, b: { text: 'A life of surprises', emoji: '🎈' } },
  { id: 'wyr11', a: { text: 'Read the same book forever', emoji: '📖' }, b: { text: 'Watch a new film every night', emoji: '🍿' } },
  { id: 'wyr12', a: { text: 'A picnic in the rain', emoji: '🌧️' }, b: { text: 'A walk in the midday heat', emoji: '☀️' } },
  { id: 'wyr13', a: { text: 'A house by the mosque', emoji: '🕌' }, b: { text: 'A house by the sea', emoji: '🌊' } },
  { id: 'wyr14', a: { text: 'A big wedding', emoji: '🎉' }, b: { text: 'A small, quiet nikkah', emoji: '🤍' } },
  { id: 'wyr15', a: { text: 'Build a business together', emoji: '🛠️' }, b: { text: 'Build a garden together', emoji: '🌱' } },
  { id: 'wyr16', a: { text: 'Remember every detail', emoji: '🔍' }, b: { text: 'Forget every argument', emoji: '🕊️' } },
  { id: 'wyr17', a: { text: 'Live without social media', emoji: '📵' }, b: { text: 'Live without takeaway', emoji: '🥡' } },
  { id: 'wyr18', a: { text: 'A perfectly organised kitchen', emoji: '🧺' }, b: { text: 'A cosy, lived-in kitchen', emoji: '🍲' } },
  { id: 'wyr19', a: { text: 'A year studying together', emoji: '🎓' }, b: { text: 'A year volunteering together', emoji: '🤲' } },
  { id: 'wyr20', a: { text: 'A winter with snow', emoji: '❄️' }, b: { text: 'A summer with long evenings', emoji: '🌇' } },
  { id: 'wyr21', a: { text: 'Always be early', emoji: '⏱️' }, b: { text: 'Always be forgiven for being late', emoji: '😅' } },
  { id: 'wyr22', a: { text: 'A home where everyone gathers', emoji: '🫖' }, b: { text: 'A home that is a quiet sanctuary', emoji: '🕯️' } },
  { id: 'wyr23', a: { text: 'Learn a language together', emoji: '🗣️' }, b: { text: 'Learn a cuisine together', emoji: '🥘' } },
  { id: 'wyr24', a: { text: 'A weekend with our families', emoji: '👨‍👩‍👧' }, b: { text: 'A weekend just the two of us', emoji: '💞' } },
  { id: 'wyr25', a: { text: 'A book picked by you', emoji: '📖' }, b: { text: 'A book picked by me', emoji: '📚' } },
  { id: 'wyr26', a: { text: 'See one country deeply', emoji: '🗺️' }, b: { text: 'See ten countries quickly', emoji: '✈️' } },
  { id: 'wyr27', a: { text: 'A handmade gift', emoji: '🧶' }, b: { text: 'A thoughtful surprise', emoji: '🎁' } },
  { id: 'wyr28', a: { text: 'A life with a dog', emoji: '🐕' }, b: { text: 'A life with a cat', emoji: '🐈' } },
  { id: 'wyr29', a: { text: 'A window with a view', emoji: '🪟' }, b: { text: 'A balcony with morning sun', emoji: '🌤️' } },
  { id: 'wyr30', a: { text: 'A slow breakfast', emoji: '🥐' }, b: { text: 'A late-night dessert', emoji: '🍰' } },
  { id: 'wyr31', a: { text: 'Be the couple who hosts', emoji: '🍽️' }, b: { text: 'Be the couple who wanders', emoji: '🎒' } },
  { id: 'wyr32', a: { text: 'A promise kept quietly', emoji: '🤍' }, b: { text: 'A grand gesture once', emoji: '✨' } },
];

/* ------------------------------------------------------------
   Who’s More Likely? — the answers are the two of you.
   ------------------------------------------------------------ */
export const WML = [
  { id: 'wml01', prompt: 'narrates the drive' },
  { id: 'wml02', prompt: 'cries at a wedding' },
  { id: 'wml03', prompt: 'forgets where the keys are' },
  { id: 'wml04', prompt: 'talks to cats' },
  { id: 'wml05', prompt: 'plans the itinerary' },
  { id: 'wml06', prompt: 'makes friends in a queue' },
  { id: 'wml07', prompt: 'takes a hundred photos' },
  { id: 'wml08', prompt: 'needs a snack immediately' },
  { id: 'wml09', prompt: 'stays calm in a crisis' },
  { id: 'wml10', prompt: 'starts a home project and leaves it half-finished' },
  { id: 'wml11', prompt: 'remembers birthdays' },
  { id: 'wml12', prompt: 'falls asleep during a film' },
  { id: 'wml13', prompt: 'suggests a road trip at midnight' },
  { id: 'wml14', prompt: 'makes the bed' },
  { id: 'wml15', prompt: 'reads the reviews before buying' },
  { id: 'wml16', prompt: 'gives the better advice' },
  { id: 'wml17', prompt: 'apologises first' },
  { id: 'wml18', prompt: 'makes the tea' },
  { id: 'wml19', prompt: 'gets lost and refuses to ask' },
  { id: 'wml20', prompt: 'is the first to laugh' },
  { id: 'wml21', prompt: 'keeps a list for everything' },
  { id: 'wml22', prompt: 'cries at a cat video' },
  { id: 'wml23', prompt: 'would move to a new city for love' },
  { id: 'wml24', prompt: 'can fix something with tape' },
  { id: 'wml25', prompt: 'wants to host Eid' },
  { id: 'wml26', prompt: 'is secretly competitive at board games' },
  { id: 'wml27', prompt: 'worries about being late' },
  { id: 'wml28', prompt: 'makes a home feel warm' },
  { id: 'wml29', prompt: 'will carry the heavy bags' },
  { id: 'wml30', prompt: 'says “one more episode”' },
  { id: 'wml31', prompt: 'remembers the small details' },
  { id: 'wml32', prompt: 'makes the other laugh at the worst moment' },
];

/* ------------------------------------------------------------
   Never Have I Ever — wholesome only.
   ------------------------------------------------------------ */
export const NHIE = [
  { id: 'nhie01', prompt: 'laughed until I couldn’t breathe' },
  { id: 'nhie02', prompt: 'stayed awake talking until Fajr' },
  { id: 'nhie03', prompt: 'cried at a cartoon' },
  { id: 'nhie04', prompt: 'forgotten what I was saying mid-sentence' },
  { id: 'nhie05', prompt: 'made a meal and pretended it was a recipe' },
  { id: 'nhie06', prompt: 'walked into a glass door' },
  { id: 'nhie07', prompt: 'made up a recipe and hoped' },
  { id: 'nhie08', prompt: 'sent a message to the wrong person' },
  { id: 'nhie09', prompt: 'kept a childhood toy' },
  { id: 'nhie10', prompt: 'spoken to a plant' },
  { id: 'nhie11', prompt: 'cried at a wedding I wasn’t invited to' },
  { id: 'nhie12', prompt: 'worn mismatched socks on purpose' },
  { id: 'nhie13', prompt: 'talked to myself in the mirror' },
  { id: 'nhie14', prompt: 'taken a photo of food before eating' },
  { id: 'nhie15', prompt: 'fallen asleep on a video call' },
  { id: 'nhie16', prompt: 'pretended to understand a joke' },
  { id: 'nhie17', prompt: 'made a wish on a star' },
  { id: 'nhie18', prompt: 'kept a diary and forgotten where' },
  { id: 'nhie19', prompt: 'missed someone before they left' },
  { id: 'nhie20', prompt: 'eaten dessert first' },
  { id: 'nhie21', prompt: 're-watched a show instead of starting a new one' },
  { id: 'nhie22', prompt: 'kept a pretty stone in my pocket' },
  { id: 'nhie23', prompt: 'laughed at my own joke' },
  { id: 'nhie24', prompt: 'planned a whole trip in my head' },
  { id: 'nhie25', prompt: 'said “I’m not hungry” and then ate' },
  { id: 'nhie26', prompt: 'hidden a snack from someone' },
  { id: 'nhie27', prompt: 'saved a voice note because it was sweet' },
  { id: 'nhie28', prompt: 'made du’a for someone without telling them' },
];

/* ------------------------------------------------------------
   This or That
   ------------------------------------------------------------ */
export const THIS_OR_THAT = [
  { id: 'tot01', a: { text: 'Sunrise', emoji: '🌅' }, b: { text: 'Sunset', emoji: '🌇' } },
  { id: 'tot02', a: { text: 'Beach', emoji: '🏖️' }, b: { text: 'Mountains', emoji: '🏔️' } },
  { id: 'tot03', a: { text: 'Tea', emoji: '🍵' }, b: { text: 'Coffee', emoji: '☕' } },
  { id: 'tot04', a: { text: 'Books', emoji: '📚' }, b: { text: 'Films', emoji: '🎬' } },
  { id: 'tot05', a: { text: 'City', emoji: '🏙️' }, b: { text: 'Countryside', emoji: '🌾' } },
  { id: 'tot06', a: { text: 'Early bird', emoji: '🐦' }, b: { text: 'Night owl', emoji: '🦉' } },
  { id: 'tot07', a: { text: 'Sweet', emoji: '🍯' }, b: { text: 'Savoury', emoji: '🥨' } },
  { id: 'tot08', a: { text: 'Cats', emoji: '🐈' }, b: { text: 'Dogs', emoji: '🐕' } },
  { id: 'tot09', a: { text: 'Planned', emoji: '🗓️' }, b: { text: 'Spontaneous', emoji: '🎲' } },
  { id: 'tot10', a: { text: 'Winter', emoji: '❄️' }, b: { text: 'Summer', emoji: '☀️' } },
  { id: 'tot11', a: { text: 'Text', emoji: '💬' }, b: { text: 'Voice note', emoji: '🎙️' } },
  { id: 'tot12', a: { text: 'Homemade', emoji: '🏠' }, b: { text: 'Restaurant', emoji: '🍽️' } },
  { id: 'tot13', a: { text: 'Mountains', emoji: '⛰️' }, b: { text: 'Desert', emoji: '🏜️' } },
  { id: 'tot14', a: { text: 'A quiet room', emoji: '🤫' }, b: { text: 'A lively room', emoji: '🗣️' } },
  { id: 'tot15', a: { text: 'Big gathering', emoji: '🎉' }, b: { text: 'Quiet evening', emoji: '🕯️' } },
  { id: 'tot16', a: { text: 'Ocean', emoji: '🌊' }, b: { text: 'Forest', emoji: '🌲' } },
  { id: 'tot17', a: { text: 'Train', emoji: '🚆' }, b: { text: 'Plane', emoji: '✈️' } },
  { id: 'tot18', a: { text: 'Window seat', emoji: '🪟' }, b: { text: 'Aisle seat', emoji: '🚶' } },
  { id: 'tot19', a: { text: 'Fresh flowers', emoji: '🌷' }, b: { text: 'Candles', emoji: '🕯️' } },
  { id: 'tot20', a: { text: 'Board game', emoji: '🎲' }, b: { text: 'Card game', emoji: '🃏' } },
  { id: 'tot21', a: { text: 'Long walk', emoji: '🚶‍♀️' }, b: { text: 'Long drive', emoji: '🚗' } },
  { id: 'tot22', a: { text: 'Cook together', emoji: '👩‍🍳' }, b: { text: 'Order in', emoji: '🥡' } },
  { id: 'tot23', a: { text: 'Museum', emoji: '🏛️' }, b: { text: 'Market', emoji: '🧺' } },
  { id: 'tot24', a: { text: 'Rain', emoji: '🌧️' }, b: { text: 'Snow', emoji: '🌨️' } },
  { id: 'tot25', a: { text: 'Call', emoji: '📞' }, b: { text: 'Message', emoji: '💬' } },
  { id: 'tot26', a: { text: 'Old city', emoji: '🏰' }, b: { text: 'New city', emoji: '🌆' } },
  { id: 'tot27', a: { text: 'Sweet breakfast', emoji: '🥞' }, b: { text: 'Savoury breakfast', emoji: '🍳' } },
  { id: 'tot28', a: { text: 'Photo album', emoji: '📔' }, b: { text: 'Camera roll', emoji: '📱' } },
  { id: 'tot29', a: { text: 'Road trip', emoji: '🛣️' }, b: { text: 'Staycation', emoji: '🛋️' } },
  { id: 'tot30', a: { text: 'Picnic', emoji: '🧺' }, b: { text: 'Candlelit dinner', emoji: '🕯️' } },
  { id: 'tot31', a: { text: 'Handwritten note', emoji: '✉️' }, b: { text: 'Surprise gift', emoji: '🎁' } },
  { id: 'tot32', a: { text: 'Rainy day indoors', emoji: '🌧️' }, b: { text: 'Sunny day out', emoji: '☀️' } },
];

/* ------------------------------------------------------------
   Deep Talks
   ------------------------------------------------------------ */
export const DEEP = [
  { id: 'deep01', prompt: 'What is one thing you are afraid to want?', emoji: '🌒' },
  { id: 'deep02', prompt: 'When do you feel most like yourself?', emoji: '🪞' },
  { id: 'deep03', prompt: 'What is a wound you are still learning to carry?', emoji: '🩹' },
  { id: 'deep04', prompt: 'What does forgiveness look like to you?', emoji: '🕊️' },
  { id: 'deep05', prompt: 'What is one thing you need more of from me?', emoji: '🤲' },
  { id: 'deep06', prompt: 'When do you feel loneliest, even when I am near?', emoji: '🌧️' },
  { id: 'deep07', prompt: 'What is a prayer you have never said out loud?', emoji: '🤍' },
  { id: 'deep08', prompt: 'What do you think we are being prepared for?', emoji: '🌱' },
  { id: 'deep09', prompt: 'What is one family pattern you want to break?', emoji: '🪢' },
  { id: 'deep10', prompt: 'What makes you feel safe enough to be soft?', emoji: '🫂' },
  { id: 'deep11', prompt: 'What is one thing you wish I asked you more about?', emoji: '💭' },
  { id: 'deep12', prompt: 'What do you need on a hard day?', emoji: '☁️' },
  { id: 'deep13', prompt: 'What does loyalty mean when no one is watching?', emoji: '🕯️' },
  { id: 'deep14', prompt: 'What is one truth you are still learning to accept?', emoji: '📖' },
  { id: 'deep15', prompt: 'What would you want me to say at your lowest?', emoji: '🌙' },
  { id: 'deep16', prompt: 'What is one thing you are proud of that you rarely mention?', emoji: '✨' },
  { id: 'deep17', prompt: 'What does a good apology sound like to you?', emoji: '🤍' },
  { id: 'deep18', prompt: 'When did you last feel truly at peace?', emoji: '🌿' },
  { id: 'deep19', prompt: 'What is one hope you are protecting?', emoji: '🕊️' },
  { id: 'deep20', prompt: 'What is one thing you want to be known for?', emoji: '🌳' },
  { id: 'deep21', prompt: 'What does “we” mean to you when life is heavy?', emoji: '🫶' },
  { id: 'deep22', prompt: 'What is a small kindness you still remember?', emoji: '🌼' },
  { id: 'deep23', prompt: 'What do you wish you could tell your younger self?', emoji: '🕰️' },
  { id: 'deep24', prompt: 'What is one way I can make your life lighter?', emoji: '🪶' },
  { id: 'deep25', prompt: 'What are you learning about patience?', emoji: '🌾' },
  { id: 'deep26', prompt: 'What is one thing you want to change about how we disagree?', emoji: '🫱🏽‍🫲🏼' },
  { id: 'deep27', prompt: 'What does a beautiful ordinary day look like to you?', emoji: '☕' },
  { id: 'deep28', prompt: 'What is one thing you want us to protect, no matter what?', emoji: '🏡' },
];

/* ------------------------------------------------------------
   Couple Quiz — answer for yourself, then see the overlap.
   ------------------------------------------------------------ */
export const QUIZ = [
  { id: 'quiz01', prompt: 'My ideal Friday night is…', options: ['A quiet meal at home', 'A long walk', 'Family or friends over', 'A film and an early night'] },
  { id: 'quiz02', prompt: 'When I’m stressed, I need…', options: ['Space', 'A hug', 'A plan', 'Someone to listen'] },
  { id: 'quiz03', prompt: 'My love language is…', options: ['Words', 'Time', 'Acts of service', 'Touch'] },
  { id: 'quiz04', prompt: 'I feel most rested after…', options: ['A slow morning', 'A long sleep', 'Time outdoors', 'A tidy home'] },
  { id: 'quiz05', prompt: 'My favourite kind of gift is…', options: ['Something handmade', 'Something useful', 'An experience', 'A handwritten note'] },
  { id: 'quiz06', prompt: 'I would rather spend a free day…', options: ['Exploring', 'At home', 'With family', 'Learning something'] },
  { id: 'quiz07', prompt: 'My comfort food is…', options: ['Soup', 'Rice and stew', 'Bread and cheese', 'Something sweet'] },
  { id: 'quiz08', prompt: 'When we disagree, I prefer to…', options: ['Talk now', 'Walk first', 'Write it down', 'Hug, then talk'] },
  { id: 'quiz09', prompt: 'The best time for a deep talk is…', options: ['Morning', 'Afternoon', 'After Maghrib', 'Late at night'] },
  { id: 'quiz10', prompt: 'I feel most appreciated when you…', options: ['Say thank you', 'Notice the little things', 'Spend time with me', 'Help without asking'] },
  { id: 'quiz11', prompt: 'My ideal trip is…', options: ['A city', 'A coast', 'A mountain', 'A quiet village'] },
  { id: 'quiz12', prompt: 'I recharge by…', options: ['Being alone', 'Being with you', 'Being with family', 'Being outdoors'] },
  { id: 'quiz13', prompt: 'My favourite season is…', options: ['Spring', 'Summer', 'Autumn', 'Winter'] },
  { id: 'quiz14', prompt: 'I like my tea…', options: ['Sweet and strong', 'Milk, no sugar', 'Green', 'I don’t drink tea'] },
  { id: 'quiz15', prompt: 'A perfect date is…', options: ['A picnic', 'A quiet restaurant', 'A long drive', 'A night in'] },
  { id: 'quiz16', prompt: 'I want more of…', options: ['Adventure', 'Rest', 'Deep talks', 'Play'] },
  { id: 'quiz17', prompt: 'When I’m sad, I want you to…', options: ['Hold me', 'Give me space', 'Make me laugh', 'Listen without fixing'] },
  { id: 'quiz18', prompt: 'I would love to learn…', options: ['A language', 'A craft', 'A sport', 'A new recipe'] },
  { id: 'quiz19', prompt: 'My favourite way to wake up is…', options: ['Slowly', 'Early and quiet', 'To the sound of rain', 'To the smell of breakfast'] },
  { id: 'quiz20', prompt: 'Our home should feel…', options: ['Calm', 'Full of laughter', 'Warm and busy', 'Simple and clean'] },
  { id: 'quiz21', prompt: 'I prefer texts that are…', options: ['Short and sweet', 'Long and thoughtful', 'Voice notes', 'Photos'] },
  { id: 'quiz22', prompt: 'The small thing I notice most is…', options: ['A clean kitchen', 'Fresh flowers', 'A full fridge', 'Soft lighting'] },
  { id: 'quiz23', prompt: 'A beautiful life, to me, is…', options: ['Peace at home', 'Adventure', 'Purpose', 'Family near'] },
  { id: 'quiz24', prompt: 'I want us to be the couple who…', options: ['Hosts everyone', 'Travels lightly', 'Builds quietly', 'Laughs often'] },
];

/* ------------------------------------------------------------
   Truth or Dare — soft truths, kind dares.
   ------------------------------------------------------------ */
export const TRUTH_DARE = [
  { id: 'td01', type: 'truth', prompt: 'What is one thing you have never told me because it felt too small?', emoji: '🤍' },
  { id: 'td02', type: 'dare', prompt: 'Give me a compliment about something I do every day.', emoji: '✨' },
  { id: 'td03', type: 'truth', prompt: 'What is a moment you felt proud of me?', emoji: '🌿' },
  { id: 'td04', type: 'dare', prompt: 'Send me a voice note of your favourite memory of us.', emoji: '🎙️' },
  { id: 'td05', type: 'truth', prompt: 'What is one thing you want more of in our home?', emoji: '🏡' },
  { id: 'td06', type: 'dare', prompt: 'Make du’a for me out loud, in your own words.', emoji: '🤲' },
  { id: 'td07', type: 'truth', prompt: 'What is a small fear you carry about the future?', emoji: '🌧️' },
  { id: 'td08', type: 'dare', prompt: 'Plan a surprise for us that costs nothing.', emoji: '🎁' },
  { id: 'td09', type: 'truth', prompt: 'When do you feel closest to me?', emoji: '💞' },
  { id: 'td10', type: 'dare', prompt: 'Describe me in three words, then explain one.', emoji: '💬' },
  { id: 'td11', type: 'truth', prompt: 'What is one thing you wish we did more often?', emoji: '🌙' },
  { id: 'td12', type: 'dare', prompt: 'Recite an ayah or a line of poetry that calms you.', emoji: '📖' },
  { id: 'td13', type: 'truth', prompt: 'What is a kindness you have never forgotten?', emoji: '🌼' },
  { id: 'td14', type: 'dare', prompt: 'Hold my hand for one minute without saying anything.', emoji: '🤝' },
  { id: 'td15', type: 'truth', prompt: 'What is one way I have changed you?', emoji: '🪞' },
  { id: 'td16', type: 'dare', prompt: 'Write me a two-line poem.', emoji: '✍️' },
  { id: 'td17', type: 'truth', prompt: 'What is a dream you have not told me yet?', emoji: '🌠' },
  { id: 'td18', type: 'dare', prompt: 'Make me a cup of tea or bring me water, then sit with me.', emoji: '🍵' },
  { id: 'td19', type: 'truth', prompt: 'What is one thing you forgive me for, without me asking?', emoji: '🕊️' },
  { id: 'td20', type: 'dare', prompt: 'Tell me five things you are grateful for about us.', emoji: '🤲' },
  { id: 'td21', type: 'truth', prompt: 'What is the hardest part of loving well?', emoji: '🫶' },
  { id: 'td22', type: 'dare', prompt: 'Call a family member together and tell them you love them.', emoji: '📞' },
  { id: 'td23', type: 'truth', prompt: 'What is one thing you want us to protect?', emoji: '🏡' },
  { id: 'td24', type: 'dare', prompt: 'Give me a hug that lasts ten seconds.', emoji: '🫂' },
  { id: 'td25', type: 'truth', prompt: 'What is a prayer you want us to make together?', emoji: '🤍' },
  { id: 'td26', type: 'dare', prompt: 'Plan a date from memory — somewhere we have never been.', emoji: '🗺️' },
  { id: 'td27', type: 'truth', prompt: 'What do you want our old age to look like?', emoji: '🌳' },
  { id: 'td28', type: 'dare', prompt: 'Say “I choose you” and mean it.', emoji: '💞' },
];

/* ------------------------------------------------------------
   Answer with a Photo
   ------------------------------------------------------------ */
export const PHOTO_PROMPTS = [
  { id: 'ph01', prompt: 'A place that feels like us', emoji: '📍' },
  { id: 'ph02', prompt: 'The view from your quiet corner', emoji: '🪟' },
  { id: 'ph03', prompt: 'Something you made', emoji: '🧶' },
  { id: 'ph04', prompt: 'A meal that tastes like home', emoji: '🍲' },
  { id: 'ph05', prompt: 'Your favourite sky today', emoji: '🌇' },
  { id: 'ph06', prompt: 'Something that made you smile today', emoji: '😊' },
  { id: 'ph07', prompt: 'A corner of our home you love', emoji: '🏡' },
  { id: 'ph08', prompt: 'A gift you keep', emoji: '🎁' },
  { id: 'ph09', prompt: 'A book that changed you', emoji: '📖' },
  { id: 'ph10', prompt: 'A photo of our first…', emoji: '📸' },
  { id: 'ph11', prompt: 'Something you want to show me', emoji: '👀' },
  { id: 'ph12', prompt: 'Your ideal weekend, in one picture', emoji: '🌿' },
  { id: 'ph13', prompt: 'A memory you wish you had a photo of', emoji: '💭' },
  { id: 'ph14', prompt: 'Something small you are grateful for', emoji: '🤲' },
  { id: 'ph15', prompt: 'A place you want to take me', emoji: '🗺️' },
  { id: 'ph16', prompt: 'A photo that feels like a du’a', emoji: '🤍' },
];

export const GAME_DECKS = {
  wyr: WYR,
  wml: WML,
  nhie: NHIE,
  thisthat: THIS_OR_THAT,
  deep: DEEP,
  quiz: QUIZ,
  truthdare: TRUTH_DARE,
  photo: PHOTO_PROMPTS,
};

export const WIDGETS = [
  { id: 'together', title: 'Together for', note: 'The days, months and years', emoji: '💞', tint: '#7A2446' },
  { id: 'countdown', title: 'Next special day', note: 'A countdown to look forward to', emoji: '📅', tint: '#8A5A2B' },
  { id: 'memory', title: 'Memory of the day', note: 'One photograph from your story', emoji: '📸', tint: '#2D6382' },
  { id: 'mood', title: 'Our moods', note: 'How your hearts are today', emoji: '🌿', tint: '#2F6B4F' },
  { id: 'distance', title: 'The distance', note: 'Two cities, one sky', emoji: '🧭', tint: '#5D4B8A' },
  { id: 'note', title: 'A little note', note: 'The last thing one of you left', emoji: '✉️', tint: '#A62A54' },
  { id: 'streak', title: 'Our streak', note: 'Days you kept showing up', emoji: '🔥', tint: '#A9463E' },
];

export const MILESTONES = [
  { id: 'first', title: 'First spark', desc: 'Answer your first question together', emoji: '✨', test: (s) => s.answers > 0 },
  { id: 'week', title: 'Seven days of us', desc: 'A seven-day conversation streak', emoji: '🌱', test: (s) => s.bestStreak >= 7 },
  { id: 'month', title: 'A month of us', desc: 'A thirty-day conversation streak', emoji: '🌳', test: (s) => s.bestStreak >= 30 },
  { id: 'story', title: 'Storytellers', desc: 'Keep ten memories', emoji: '📖', test: (s) => s.memories >= 10 },
  { id: 'explorer', title: 'Little explorers', desc: 'Mark five places on your map', emoji: '🗺️', test: (s) => s.places >= 5 },
  { id: 'deep', title: 'Deep waters', desc: 'Answer fifty questions', emoji: '🌊', test: (s) => s.answers >= 50 },
  { id: 'play', title: 'Playful hearts', desc: 'Finish five games', emoji: '🎲', test: (s) => s.games >= 5 },
  { id: 'notes', title: 'Note keepers', desc: 'Write ten shared notes', emoji: '✉️', test: (s) => s.notes >= 10 },
  { id: 'gratitude', title: 'Grateful hearts', desc: 'Check in for seven days', emoji: '🤲', test: (s) => s.moods >= 7 },
];
