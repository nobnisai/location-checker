function handleLookup() {
    const input = document.getElementById("locationInput").value.trim();
    const { lat, lng } = extractCoordinates(input);
    if (lat && lng) {
      reverseGeocode(lat, lng);
    } else {
      document.getElementById("result").innerText = "❌ Could not extract valid coordinates.";
    }
  }
  
  function extractCoordinates(input) {
    // Match decimal degrees
    const decimalMatch = input.match(/(-?\d{1,3}\.\d+)[,\s]+(-?\d{1,3}\.\d+)/);
    if (decimalMatch) {
      return { lat: parseFloat(decimalMatch[1]), lng: parseFloat(decimalMatch[2]) };
    }
  
    // Match DMS (e.g., 11°32'30.6"N 104°52'24.5"E)
    const dmsRegex = /(\d+)[°:\s](\d+)[\'′:\s](\d+(?:\.\d+)?)[\"″]?\s*([NSEW])/gi;
    const dmsMatches = [...input.matchAll(dmsRegex)];
    if (dmsMatches.length === 2) {
      const toDecimal = ([_, deg, min, sec, dir]) => {
        let val = Number(deg) + Number(min)/60 + Number(sec)/3600;
        if (dir === 'S' || dir === 'W') val *= -1;
        return val;
      };
      return {
        lat: toDecimal(dmsMatches[0]),
        lng: toDecimal(dmsMatches[1])
      };
    }
  
    // Match Google Maps shortened URL
    const mapsLink = input.match(/https:\/\/maps\.app\.goo\.gl\/[^\s]+/);
    if (mapsLink) {
      alert("⚠️ Google Maps short links need to be opened manually to copy full coordinates.");
    }
  
    return {};
  }
  
  function reverseGeocode(lat, lng) {
    const resultBox = document.getElementById("result");
    resultBox.innerHTML = "🔄 Looking up address...";
  
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
    fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'location-checker-app (your-email@example.com)'
      }
    })
    .then(res => res.json())
    .then(data => {
      if (!data || !data.address) {
        resultBox.innerHTML = "❌ Address not found.";
        return;
      }
  
      const a = data.address;
      const display = `
        <strong>🧭 Coordinates:</strong> ${lat.toFixed(6)}, ${lng.toFixed(6)}<br/>
        <strong>🏠 Full Address:</strong> ${data.display_name}<br/><br/>
        <strong>➡️ Details:</strong><br/>
        Street: ${a.road || "-"}<br/>
        House Number: ${a.house_number || "-"}<br/>
        Suburb/Village: ${a.suburb || a.village || "-"}<br/>
        Commune: ${a.city_district || a.county || "-"}<br/>
        District: ${a.district || "-"}<br/>
        Province: ${a.state || "-"}<br/>
        Country: ${a.country || "-"}
      `;
      resultBox.innerHTML = display;
    })
    .catch(err => {
      console.error(err);
      resultBox.innerHTML = "❌ Error during lookup.";
    });
  }
  

  document.getElementById('locationInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault(); // prevent form submission if inside a form
      handleLookup();
    }
  });
  