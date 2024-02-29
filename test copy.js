function autoScroll() {
	// Functie om automatisch te scrollen en de inhoud van de plp-item-wrapper elementen naar een JSON-bestand te sturen
	let container = document.querySelector(".screen-container"); // Vervang 'CSS_SELECTOR' door de werkelijke selector van de scroll-container.
	let totalHeight = 0; // Variabele om de totale gescrolde hoogte bij te houden
	let distance = 100; // De afstand om elke keer te scrollen. Pas indien nodig aan.
	let scrollTimer; // Variabele voor het bijhouden van de setInterval voor het scrollen
	let checkTimer; // Variabele voor het bijhouden van de setInterval voor het controleren van de targetdiv
	let targetNotFoundCount = 0; // Teller voor het bijhouden van het aantal keren dat de targetdiv niet is gevonden

	let type = document.querySelector(".plp-results-header > h1 > span ").innerText // Kijkt naar de webpage waar je bent en maakt dan het variable type aan

	// Comment de volgende 2 regels uit als je het scrollen wilt skippen
	// sendPlpItemWrapperContentToJson();
	// return false;


	function scrollDown() {
		// Functie om te naar beneden te scrollen
		container.scrollBy(0, distance);
		totalHeight += distance;
		let scrollHeight = container.scrollHeight;
		if (container.scrollTop + container.clientHeight >= scrollHeight) {
			console.log("Reached bottom");
			clearInterval(scrollTimer);
			clearInterval(checkTimer);	
			// Bereikte bodem van de pagina, verzend de inhoud van de plp-item-wrapper elementen naar een JSON-bestand
			sendPlpItemWrapperContentToJson();
		}
	}
	// Functie om de inhoud van de plp-item-wrapper elementen naar een JSON-bestand te sturen

	function sendPlpItemWrapperContentToJson() {
		clearInterval(scrollTimer);
		clearInterval(checkTimer);
		const link = document.querySelectorAll(".plp-results-list > a");

		let data = []; // Array om de gegevens van de plp-item-wrapper elementen op te slaan
		for (let i = 0; i < link.length; i++) {
			// Standaard variables zetten
			let image_url = link[i].querySelector("img");
			image_url = image_url === null ? "" : image_url.src;

			let merk = link[i].querySelector("h3");
			let inhoud = link[i].querySelector(".list-item-content-center > div > div > div > span.OSFillParent");

			let linkArray = link[i].href.split("-");
			let feed_item_id = "-" + linkArray[linkArray.length - 1];

			// Link affiliate bevat alleen de bewerkte item link, het begin met de parameters wordt in de specifieke scraper toegevoegd
			let linkAffiliate = link[i].href
				.replaceAll("/", "%2f")
				.replaceAll("?", "%3F")
				.replace("=", "%3D")
				.replace("&", "%26");

			let in_aanbieding = 0;
			let van_prijs = link[i].querySelector(".plp-item-price").innerText.replace('\n', '');
			let voor_prijs = 0;

			let aanbieding_prijs = link[i].querySelector(".product-header-price-previous > span");
			let aanbieding_string = link[i].querySelector(".multiline-truncation-text.multiline-truncation-text-2.text-red");

			let product_aantal = aanbieding_aantal = 1;
			
			// let eind_datum_aanbieding = link[i].querySelector(".text-tertiary").innerText
			
			if (aanbieding_prijs !== null || aanbieding_string !== null) {
				// Er is een aanbieding
				// Kijk of het rooie blok bestaat
				in_aanbieding = 1;
				if (aanbieding_string !== null) {
					aanbieding_string = aanbieding_string.innerText.toLowerCase();
					console.log(aanbieding_string);

					// If else maken voor aanbieding cases, switch mag niet?
					// Javascript gaming

					// bijv 25% korting
					if (aanbieding_string.match(/\d{1,3} % korting/)) {
						// aanbieding is 1 stuk, hoef geen percentage te berekenen
						product_aantal = 1;
						van_prijs = link[i].querySelector(".product-header-price-previous > span").innerText;
						voor_prijs = link[i].querySelector(".product-header-price-integer > span").innerText + link[i].querySelector(".product-header-price-decimals > span").innerText;

					} else if (aanbieding_string.match(/\d{1,3} voor \d{1,3}.\d{1,2}/)) {
						// Bij 3 voor 8 euro
						let explode = aanbieding_string.split(" ");
						product_aantal = explode[0];
						van_prijs = van_prijs * product_aantal;
						voor_prijs = explode[2];
					} else {
						alert('onbekende aanbieding, zie ' + link[i].href + ' en ' + aanbieding_string);
						console.log('onbekende aanbieding, zie ' + link[i].href + ' en ' + aanbieding_string);
						// Is er niet, gebruik de doorgestreepte prijs en normale prijs, aantal = 1
						product_aantal = 1
						voor_prijs = link[i].querySelector(".product-header-price-integer > span").innerText + link[i].querySelector(".product-header-price-decimals > span").innerText;
					}
				} else {
					// Is er niet, gebruik de doorgestreepte prijs en normale prijs, aantal = 1
					product_aantal = 1
					voor_prijs = link[i].querySelector(".product-header-price-integer > span").innerText + link[i].querySelector(".product-header-price-decimals > span").innerText;
					// Als er een \n in de van_prijs zit, haal het weg
					if (van_prijs.includes("\n")) {
						van_prijs = van_prijs.split("\n")[1];
					}
				}
			} else {
				in_aanbieding = 0;
				voor_prijs = 0.00;
			}

			// Array maken met alle data. Deze data wordt later in een JSON bestand gezet
			// Data is zo gemaakt voor alle 3 de scrapers, niet elke key wordt op elke scraper gebruikt. 
			let itemData = {
				type: 'bier', // Alleen voor Biernet
				biernaam: merk.innerText + " " + inhoud.innerText, // Alleen voor Biernet

				product_aantal: product_aantal,
				aanbieding_aantal: aanbieding_aantal, // Standaard 1
				// eind_datum_aanbieding: eind_datum_aanbieding,

				feed_item_id: feed_item_id, // Winkel id wordt in specifieke scraper toegevoegd
				winkel__winkel_id: "", // Winkel id wordt in specifieke scraper toegevoegd

				shop_item_url: link[i].href, // De loopie link
				image_url: image_url,
				affiliate_url: linkAffiliate, // Begindeel wordt in de specifieke scraper toegevoegd

				van_prijs: van_prijs,
				voor_prijs: voor_prijs,
				in_aanbieding: in_aanbieding,
				in_assortiment: 1, // Er is geen duidelijke indicator op de website dat iets niet in assortiment is. Daarom altijd 1

				merk: merk.innerText,
				inhoud: inhoud.innerText,

				beschikbaarheid: "", // Is in de winkel en online te bestellen
				begin_datum: "",
				eind_datum: "",
				ean: "", //  Staat nergens op de website, alleen PPCv3
				categorie: "", // Alleen PPCv3
			};

			// console.log(itemData); // Debug

			data.push(itemData);
		}

		// Naam opschonen
		type = type.toLowerCase().replace(',', '').replace(' ', '-');

		const jsonData = JSON.stringify(data, null, 2);
		const blob = new Blob([jsonData], {
			type: "application/json"
		});
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${type}.json`;
		a.click();
		window.URL.revokeObjectURL(url);


	}
	// Start de setInterval voor het scrollen
	scrollTimer = setInterval(scrollDown, 100); // De intervaltijd in milliseconden. Pas indien nodig aan voor soepeler of sneller scrollen.

	// Start de setInterval om periodiek te controleren of de gewenste div-klasse verschijnt of verdwijnt
	checkTimer = setInterval(() => {
		let targetDiv = document.querySelector(
			".text-align-center.text-neutral-8.padding-y-xxxl"
		);
		if (targetDiv) {
			// Als de klasse aanwezig is, stop met scrollen en log een bericht
			console.log("Target div found. Scroll stopped.");
			clearInterval(scrollTimer);

			targetNotFoundCount = 0; // Reset de teller
		} else {
			// Als de klasse niet aanwezig is, verhoog de teller en controleer of het limiet is bereikt
			targetNotFoundCount++;
			if (targetNotFoundCount > 100) {
				console.log(
					"Target div not found more than 100 times. Stopping scroll."
				);
				clearInterval(scrollTimer);
				clearInterval(checkTimer);
				sendPlpItemWrapperContentToJson();
			} else {
				// Als het limiet niet is bereikt, log een bericht en ga door met scrollen
				console.log("Target div not found. Starting scroll...");
				totalHeight = 0; // Reset de scrollpositie
				clearInterval(scrollTimer);
				scrollTimer = setInterval(scrollDown, 100);
			}
		}
	}, 500); // Interval voor het controleren in milliseconden
}

autoScroll();