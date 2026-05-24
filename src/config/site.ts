export const siteConfig = {
  name: 'Daveen African Food & Grocery',
  shortName: 'Daveen Grocery',
  description: 'Authentic African and Caribbean groceries delivered to your door in Chicago. Shop West African staples, spices, frozen foods, meat, seafood, and more.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://daveengrocery.com',
  phone: process.env.NEXT_PUBLIC_STORE_PHONE ?? '+17736210000',
  address: {
    street: '6421 S King Dr Suite B',
    city: 'Chicago',
    state: 'IL',
    zip: '60637',
    full: '6421 S King Dr Suite B, Chicago, IL 60637',
    lat: parseFloat(process.env.NEXT_PUBLIC_STORE_LAT ?? '41.7796'),
    lng: parseFloat(process.env.NEXT_PUBLIC_STORE_LNG ?? '-87.6148'),
  },
  hours: {
    weekday: '8:00 AM – 9:00 PM',
    saturday: '8:00 AM – 10:00 PM',
    sunday: '9:00 AM – 8:00 PM',
  },
  social: {
    instagram: 'https://instagram.com/daveengrocery',
    facebook: 'https://facebook.com/daveengrocery',
    twitter: 'https://twitter.com/daveengrocery',
  },
  keywords: [
    'African grocery Chicago', 'Nigerian food Chicago', 'Ghanaian grocery',
    'Caribbean grocery', 'African food delivery Chicago', 'West African ingredients',
    'egusi Chicago', 'palm oil Chicago', 'African spices', 'fufu Chicago',
  ],
  sameDayOrderCutoff: '14:00', // 2:00 PM
  loyaltyPointsPerDollar: 10,  // 10 points per $1 spent
  loyaltyDollarPerPoint: 100,  // 100 points = $1 discount
}
