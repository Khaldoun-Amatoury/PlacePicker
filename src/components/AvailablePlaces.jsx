import { useState, useEffect } from "react";
import Places from "./Places.jsx";
import Error from "./Error.jsx";
import { sortPlacesByDistance } from "../loc.js";
import { fetchAvailablePlaces } from "../http.js";

export default function AvailablePlaces({ onSelectPlace }) {
  const [isFetching, setIsFetching] = useState(false);
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [error, setError] = useState();
  //fetch is used to send https request to server to fetch data and to send data
  //promise is a standard js object that will yield different values depending on the state of that promise and to access those different values you can chain methods on the result of calling fetch like adding then method
  //this code would create a infinite loop this code executes every time the component function executes and a new request would be sent every time this comp function executes and in the second then block we then update the state which of course causes this comp function to execute again so this makes a infinite loop but thankfully side effect solves this.
  //you can't use await fetch because in react component you can't put beside the component name async keyword it is restricted

  useEffect(() => {
    async function fetchPlaces() {
      //here you can put async because this is a function defined by you not by react
      setIsFetching(true);

      try {
        //we outsourced the fetching code and we can reuse that in other parts that need the same data
        const places = await fetchAvailablePlaces();

        navigator.geolocation.getCurrentPosition((position) => {
          const sortedPlaces = sortPlacesByDistance(
            places,
            position.coords.latitude,
            position.coords.altitude
          );
          setAvailablePlaces(sortedPlaces);
          setIsFetching(false);
        });
      } catch (error) {
        setError({
          message:
            error.message || "Could not fetch places, please try again later.",
        });
        setIsFetching(false);
      }
    }

    fetchPlaces(); //call it
    /*
    fetch("http://localhost:3000/places")
      .then((response) => {
        return response.json();
      }) 
      .then((resData) => {
        setAvailablePlaces(resData.places);
      });
      */
  }, []); //we have an empty dependency array so this executes once and only once

  if (error) {
    return <Error title="An error occured!" message={error.message} />;
  }
  return (
    <Places
      title="Available Places"
      places={availablePlaces}
      isLoading={isFetching}
      loadingText="Fetching place data..."
      fallbackText="No places available."
      onSelectPlace={onSelectPlace}
    />
  );
}
