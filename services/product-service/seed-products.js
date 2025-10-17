/**
 * Seed script for product service
 * Creates sample gift card products
 */

const sampleProducts = [
    {
        name: "Razer Gold Gift Card",
        description: "Razer Gold is the universal virtual credits for gamers. Use Razer Gold to buy games and in-game content from over 3,500 games and entertainment partners worldwide.",
        category: "gift_card",
        type: "digital_code",
        isFeatured: true,
        images: [
            "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=300&fit=crop"
        ],
        tags: [ "gaming", "digital", "razer", "gold" ],
        regionalPricing: [
            {
                region: "MY",
                currency: "MYR",
                price: 50,
                stock: 100
            },
            {
                region: "TH",
                currency: "THB",
                price: 400,
                stock: 50
            },
            {
                region: "US",
                currency: "USD",
                price: 10,
                stock: 200
            }
        ]
    },
    {
        name: "iTunes Gift Card",
        description: "Redeem your iTunes Gift Card and get credit for the App Store, iTunes Store, Apple Music, and more. Use it for apps, games, music, movies, TV shows, and more.",
        category: "gift_card",
        type: "digital_code",
        isFeatured: true,
        images: [
            "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop"
        ],
        tags: [ "apple", "music", "apps", "digital" ],
        regionalPricing: [
            {
                region: "MY",
                currency: "MYR",
                price: 25,
                stock: 75
            },
            {
                region: "TH",
                currency: "THB",
                price: 200,
                stock: 40
            },
            {
                region: "US",
                currency: "USD",
                price: 15,
                stock: 150
            }
        ]
    },
    {
        name: "Google Play Gift Card",
        description: "Google Play gift cards are the perfect gift for anyone who loves apps, games, movies, books, and more on Google Play. Redeem for millions of apps, games, and more.",
        category: "gift_card",
        type: "digital_code",
        isFeatured: true,
        images: [
            "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=300&fit=crop"
        ],
        tags: [ "google", "android", "apps", "digital" ],
        regionalPricing: [
            {
                region: "MY",
                currency: "MYR",
                price: 30,
                stock: 60
            },
            {
                region: "TH",
                currency: "THB",
                price: 250,
                stock: 30
            },
            {
                region: "US",
                currency: "USD",
                price: 20,
                stock: 100
            }
        ]
    },
    {
        name: "Steam Wallet Code",
        description: "Add funds to your Steam Wallet to purchase games, software, hardware, and any other item you can purchase on Steam.",
        category: "gift_card",
        type: "digital_code",
        isFeatured: false,
        images: [
            "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop"
        ],
        tags: [ "steam", "gaming", "pc", "digital" ],
        regionalPricing: [
            {
                region: "MY",
                currency: "MYR",
                price: 20,
                stock: 80
            },
            {
                region: "TH",
                currency: "THB",
                price: 150,
                stock: 25
            },
            {
                region: "US",
                currency: "USD",
                price: 25,
                stock: 120
            }
        ]
    },
    {
        name: "PlayStation Network Card",
        description: "Add funds to your PlayStation Network wallet to purchase games, add-ons, subscriptions, and more from the PlayStation Store.",
        category: "gift_card",
        type: "digital_code",
        isFeatured: false,
        images: [
            "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop"
        ],
        tags: [ "playstation", "gaming", "console", "digital" ],
        regionalPricing: [
            {
                region: "MY",
                currency: "MYR",
                price: 100,
                stock: 40
            },
            {
                region: "TH",
                currency: "THB",
                price: 800,
                stock: 20
            },
            {
                region: "US",
                currency: "USD",
                price: 50,
                stock: 80
            }
        ]
    },
    {
        name: "Xbox Gift Card",
        description: "Buy games, devices, and more at Microsoft Store. Use your Xbox Gift Card to get the latest games, movies, TV shows, and more for Xbox and Windows.",
        category: "gift_card",
        type: "digital_code",
        isFeatured: false,
        images: [
            "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=400&h=300&fit=crop"
        ],
        tags: [ "xbox", "gaming", "microsoft", "digital" ],
        regionalPricing: [
            {
                region: "MY",
                currency: "MYR",
                price: 75,
                stock: 35
            },
            {
                region: "TH",
                currency: "THB",
                price: 600,
                stock: 15
            },
            {
                region: "US",
                currency: "USD",
                price: 30,
                stock: 60
            }
        ]
    },
    {
        name: "Netflix Gift Card",
        description: "Give the gift of entertainment with a Netflix gift card. Perfect for movie lovers and TV show enthusiasts.",
        category: "gift_card",
        type: "digital_code",
        isFeatured: true,
        images: [
            "https://images.unsplash.com/photo-1478720568477-b2709ad0cd58?w=400&h=300&fit=crop"
        ],
        tags: [ "netflix", "streaming", "entertainment", "digital" ],
        regionalPricing: [
            {
                region: "MY",
                currency: "MYR",
                price: 45,
                stock: 90
            },
            {
                region: "TH",
                currency: "THB",
                price: 350,
                stock: 45
            },
            {
                region: "US",
                currency: "USD",
                price: 40,
                stock: 110
            }
        ]
    },
    {
        name: "Spotify Gift Card",
        description: "Give the gift of music with a Spotify gift card. Perfect for music lovers who want unlimited access to millions of songs.",
        category: "gift_card",
        type: "digital_code",
        isFeatured: false,
        images: [
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop"
        ],
        tags: [ "spotify", "music", "streaming", "digital" ],
        regionalPricing: [
            {
                region: "MY",
                currency: "MYR",
                price: 35,
                stock: 70
            },
            {
                region: "TH",
                currency: "THB",
                price: 280,
                stock: 35
            },
            {
                region: "US",
                currency: "USD",
                price: 15,
                stock: 95
            }
        ]
    }
];

// Function to seed products
async function seedProducts() {
    console.log( '🌱 Starting product seeding...' );

    let successCount = 0;
    let errorCount = 0;

    for ( const productData of sampleProducts ) {
        try {
            const response = await fetch( 'https://product.topupforme.com/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify( productData ),
            } );

            const result = await response.json();

            if ( result.success ) {
                console.log( `✅ Created: ${ productData.name }` );
                successCount++;
            } else {
                console.log( `❌ Failed: ${ productData.name } - ${ result.error }` );
                errorCount++;
            }
        } catch ( error ) {
            console.log( `❌ Error: ${ productData.name } - ${ error.message }` );
            errorCount++;
        }
    }

    console.log( `\n📊 Seeding completed:` );
    console.log( `✅ Success: ${ successCount }` );
    console.log( `❌ Failed: ${ errorCount }` );
    console.log( `📦 Total: ${ sampleProducts.length }` );
}

// Run the seeding
seedProducts().catch( console.error );
