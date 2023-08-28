const PORT = process.env.PORT || 8000;
const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

// API endpoint
app.get("/restaurants", async (req, res) => {
  try {
    const locations = [
      "amsterdam",
      "london",
      "berlin",
      "barcelona",
      "stockholm",
      "paris",
    ];
    const yelpApiHeaders = {
      headers: {
        Authorization: `Bearer ${process.env.YELP_API_KEY}`,
      },
    };

    const restaurantData = [];

    // Fetch data for each location
    for (const location of locations) {
      const response = await axios.get(
        `https://api.yelp.com/v3/businesses/search?location=${location}&term=vegetarian&attributes=liked-by-vegetarians&sort_by=best_match&limit=20`,
        yelpApiHeaders
      );

      // Extract relevant restaurant information from the response
      const restaurants = response.data.businesses.map((restaurant) => {
        const locationArray = restaurant.location.display_address;
        let city = "";

        // Extract the city based on a specific index depending on the location
        if (
          locationArray.length >= 3 &&
          locationArray[locationArray.length - 3].trim().toLowerCase() ===
            "london"
        ) {
          city = locationArray[locationArray.length - 4]; // City is the fourth last element for London
        } else {
          city = locationArray[locationArray.length - 2]; // City is the second last element for other locations
        }

        // Remove postcode if it exists
        const postcodeRegex = /\b\d{5}\b/; // Assuming the postcode consists of 5 digits
        city = city.replace(postcodeRegex, "").trim();

        // Remove numbers and strings under 4 characters from the city
        const words = city.split(" ");
        city = words
          .filter((word) => word.length >= 4 && /^[a-z]+$/i.test(word))
          .join(" ");

        return {
          name: restaurant.name,
          city: city,
          picture: restaurant.image_url,
          cuisine: restaurant.categories
            .map((category) => category.title)
            .join(", "),
          rating: restaurant.rating,
          reviewCount: restaurant.review_count,
          link: restaurant.url,
        };
      });

      // Append the extracted data to the main array
      restaurantData.push(...restaurants);
    }

    res.json(restaurantData);
  } catch (error) {
    if (error.response && error.response.status === 400) {
      // Handle the specific 400 error response here
      const errorMessage = "Bad Request";
      res.status(400).json({ error: errorMessage });
    } else {
      // Handle other errors (network errors, 500 responses, etc.)
      const errorMessage = "Error fetching data";
      res.status(500).json(process.env.YELP_API_KEY);
    }
  }
});

app.listen(PORT, () =>
  console.log(`Claires awesome veggie me server running on PORT ${PORT}`)
);
