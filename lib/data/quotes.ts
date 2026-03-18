export interface Quote {
  text: string;
  author: string;
}

export const quotes: Quote[] = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "What you get by achieving your goals is not as important as what you become.", author: "Zig Ziglar" },
  { text: "The impediment to action advances action. What stands in the way becomes the way.", author: "Marcus Aurelius" },
  { text: "If you want to lift yourself up, lift up someone else.", author: "Booker T. Washington" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "We become what we think about most of the time.", author: "Earl Nightingale" },
  { text: "Imagination is more important than knowledge.", author: "Albert Einstein" },
  { text: "Be the change that you wish to see in the world.", author: "Mahatma Gandhi" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "There is nothing permanent except change.", author: "Heraclitus" },
  { text: "What we achieve inwardly will change outer reality.", author: "Plutarch" },
  { text: "Well done is better than well said.", author: "Benjamin Franklin" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "The best way out is always through.", author: "Robert Frost" },
  { text: "Knowing is not enough; we must apply. Willing is not enough; we must do.", author: "Johann Wolfgang von Goethe" },
  { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
  { text: "The best revenge is massive success.", author: "Frank Sinatra" },
  { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "If you look at what you have in life, you'll always have more.", author: "Oprah Winfrey" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { text: "The purpose of our lives is to be happy.", author: "Dalai Lama" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
  { text: "When you reach the end of your rope, tie a knot in it and hang on.", author: "Franklin D. Roosevelt" },
  { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
  { text: "A person who never made a mistake never tried anything new.", author: "Albert Einstein" },
  { text: "Happiness is not something ready made. It comes from your own actions.", author: "Dalai Lama" },
  { text: "The wound is the place where the light enters you.", author: "Rumi" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { text: "Alone we can do so little; together we can do so much.", author: "Helen Keller" },
  { text: "Life is really simple, but we insist on making it complicated.", author: "Confucius" },
  { text: "Darkness cannot drive out darkness; only light can do that.", author: "Martin Luther King Jr." },
  { text: "If you want to go fast, go alone. If you want to go far, go together.", author: "African Proverb" },
  { text: "No one can make you feel inferior without your consent.", author: "Eleanor Roosevelt" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
  { text: "The best preparation for tomorrow is doing your best today.", author: "H. Jackson Brown Jr." },
  { text: "An unexamined life is not worth living.", author: "Socrates" },
  { text: "Turn your wounds into wisdom.", author: "Oprah Winfrey" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "We may encounter many defeats but we must not be defeated.", author: "Maya Angelou" },
  { text: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
];

export const FALLBACK_QUOTE: Quote = {
  text: "The best time to start is now.",
  author: "Unknown",
};

export function getRandomQuote(): Quote {
  if (quotes.length === 0) return FALLBACK_QUOTE;
  return quotes[Math.floor(Math.random() * quotes.length)];
}
