import { useState, useEffect } from 'react';
import { useRouter } from 'next/router'
import Link from 'next/link'
var parseString = require("xml2js").parseString;
import 'tailwindcss/tailwind.css'
import Footer from '../../components/footer';
import { mensaData } from '..';
import { DayButton } from '../../components/dayButton';
// import "../../assets/css/mensa.module.css"
import clientPromise from '../../lib/mongodb'


export default function Mensa(props) {
	const router = useRouter()
  	const { mensa } = router.query

	// Switcher for Nutiotional Intformation is not yet working
	const [offers, setOffers] = useState([])
	
	const collapseNutrionionInfo = (index) => {
		let tempOffers = [...offers]
		let tempOffer = tempOffers[index]
		tempOffer = !tempOffer
		tempOffers[index] = tempOffer
		
		setOffers(tempOffers)
	}

    return (
        <div className="space-y-6 break-words mx-5 mt-12">
			<style jsx>
				{`
					.daySelection{
						position: relative;
					}
					.daySelection::before{
						content: "";
						position: absolute;
						right: 0;
						width: 20%;
						height: 100%;
						background: linear-gradient(270deg, white, transparent);
						pointer-events: none;
					}
					.open {
						transition: .3s;
						transform: rotate(180deg)
					}
					.closed {
						transition: .3s;
						transform: rotate(0);
					}
					.ReactCollapse--collapse {
						transition: height 500ms;
						}
				`}
			</style>

			<div>
				<Link href="/">
					<a className="p-6 pl-0 absolute ">
					&larr;
					</a>
				</Link>

				<h2 className="capitalize text-2xl text-center py-6">{mensa}</h2>
			</div>

			<div className="flex justify-between">
				{
					props.openingTimes.open ? 
					<>
						<div className="font-medium bg-green-3 py-1.5 px-4 rounded-full inline-flex items-center gap-2">
							<span className="bg-green-2 w-2 h-2 rounded-full"></span>
							offen bis {props.openingTimes.openUntil}
						</div>
					</> : 
					<>
						<div className="font-medium bg-green-3 py-1.5 px-4 rounded-full">öffnet um {props.openingTimes.openFrom}</div>
					</>
				}

				{/* <div className='flex items-center gap-2'>
					<div className="font-medium bg-green-3 py-1.5 px-4 rounded-full text-green-w7">1.5km</div>
					<a href='#'>Route &rarr;</a>
				</div> */}
			</div>

			{/* Day Selection */}
			<div className="daySelection">
				<div className="space-x-4 flex overflow-x-scroll overflow-y-hidden">
					{
						props.days.map((day, i) => {
							let isSelected = props.selectedWeekday - (5 - props.days.length) === i
							return <DayButton mensa={mensa} day={day} isSelected={isSelected} router={router}/>
						})
					}
				</div>
			</div>

			<div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 2xl:grid-cols-3">
            {props.foodOffers.map((offer, i) => {
				return (
					<div className="flex-initial rounded-xl bg-green-3">
						<div className="p-8 pb-4">
							<p className="font-medium text-sm text-gray-400">{offer.titel}</p>
							<p className="text-2xl font-medium">{offer.beschreibung}</p>
							<div className="mt-9 flex justify-between flex-col xs:flex-row items-start gap-y-2">
								<p className="font-bold text-gray-400 text-sm"><span className="bg-green rounded-full py-1 px-4 text-black inline-block">{offer.preise.preis_s} €</span> <span className='text-green-w7'>{offer.preise.preis_g} €</span></p>
								{offer.labels.filter !== "all" && <p className="capitalize font-bold text-sm bg-green rounded-full py-1 px-4 inline-block">{offer.labels.filter}</p>}
							</div>
						</div>
						<div className="">
							<button className="px-8 py-4 border-t w-full flex items-center gap-2" onClick={() => collapseNutrionionInfo(i)}>
								<svg width="6" height="6" fill="none" xmlns="http://www.w3.org/2000/svg" className={offers[i] ? "open" : "closed"}>
									<path d="M3.83 4.74a1 1 0 0 1-1.66 0L.56 2.3A1 1 0 0 1 1.39.75h3.22a1 1 0 0 1 .83 1.55l-1.6 2.44Z" fill="#000"/>
								</svg>
								<p className="font-medium text-green-w7">Nährwerte</p>
							</button>
							{offers[i] && (
								<div className="px-8 pb-4">
									{offer.nutrients?.map(nutrient => {
										return <p>{nutrient}</p>
									})}
								</div>
							)}
						</div>
					</div>
				)
			})}
			</div>
			<Footer />
        </div>
    )
}

export async function getServerSideProps(context) {
	function getWeekNumber(d) {
		// Copy date so don't modify original
		d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
		// Set to nearest Thursday: current date + 4 - current day number
		// Make Sunday's day number 7
		d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
		// Get first day of year
		var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
		// Calculate full weeks to nearest Thursday
		var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
		// Return array of year and week number
		return `${d.getUTCFullYear()}${weekNo}`;
	}

	let selectedWeekday = 0;
	switch (context.query.day) {
		case "montag":
			selectedWeekday = 0
			break;
		case "dienstag":
			selectedWeekday = 1
			break;
		case "mittwoch":
			selectedWeekday = 2
			break;
		case "donnerstag":
			selectedWeekday = 3
			break;
		case "freitag":
			selectedWeekday = 4
			break;
		default:
			break;
	}

	// console.log(context.query.mensa, context.query.day, selectedWeekday)

	const currentDate = new Date()
	let currentWeekday = currentDate.getDay() // if Weekday between 1 and 5 its in the weekday
	currentWeekday = currentWeekday === 0 ? 6 : currentWeekday - 1
	const isWeekday = currentWeekday < 5;
	let days = [
		{
			mainText: "Mo",
			subText: "",
			url: "montag",
		},
		{
			mainText: "Di",
			subText: "",
			url: "dienstag",
		},
		{
			mainText: "Mi",
			subText: "",
			url: "mittwoch",
		},
		{
			mainText: "Do",
			subText: "",
			url: "donnerstag",
		},
		{
			mainText: "Fr",
			subText: "",
			url: "freitag",
		},
	]

	// Get Dates
	for (let i = 0; i < 5; i++) {
		let tempDate = new Date(currentDate)
		if(i === currentWeekday){
			days[i].subText = `${days[i].mainText}, ${tempDate.getDate()}.${tempDate.getMonth()}`
			// days[i].subText = `${days[i].mainText}, ${tempDate.getDate()}. ${new Intl.DateTimeFormat('de-DE', {month: 'short'}).format(tempDate)}`
			days[i].mainText = "Heute"
		} else {
			tempDate.setDate(currentDate.getDate() + (i - currentWeekday))
			days[i].subText = `${tempDate.getDate()}.`
		}
	}

	days = days.slice(currentWeekday)

	// const router = useRouter()
	// const {mensa} = router.query

	const urls = {
		golm: "https://xml.stw-potsdam.de/xmldata/go/xml.php",
		fhp: "https://xml.stw-potsdam.de/xmldata/ka/xml.php",
		neues_palais: "https://xml.stw-potsdam.de/xmldata/np/xml.php"
	}
	let url;

	switch (context.query.mensa) {
		case "golm":
			url = urls.golm
			break;
		case "fhp":
			url = urls.fhp
			break;
		case "neues-palais":
			url = urls.neues_palais
		default:
			url = urls.fhp
			break;
	}

	function foodTypeChecker(label){
	const foodTypes = {
		SCHWEIN: "schweinefleisch",
		GEFLUEGEL: "gefluegel",
		LAMM: "lamm",
		RIND: "rindfleisch",
		FISCH: "fisch",
		VEGETARISCH: "vegetarisch",
		VEGAN: "vegan"
	}
	
	const filterTypes = {
		VEGETARISCH: "🥛 Vegetarisch",
		VEGAN: "🌱 Vegan",
		PESCETARISCH: "🐟 Pescetarisch",
		ALL: "all"
	}
	
	switch (label) {
		case foodTypes.SCHWEIN:
		return {foodType: foodTypes.SCHWEIN, filter: filterTypes.ALL}
	
		case foodTypes.GEFLUEGEL:
		return {foodType: foodTypes.GEFLUEGEL, filter: filterTypes.ALL}
	
		case foodTypes.LAMM:
		return {foodType: foodTypes.LAMM, filter: filterTypes.ALL}
		
		case foodTypes.RIND:
		return {foodType: foodTypes.RIND, filter: filterTypes.ALL}
		
		case foodTypes.FISCH:
		return {foodType: foodTypes.FISCH, filter: filterTypes.PESCETARISCH}
		
		case foodTypes.VEGETARISCH:
		return {foodType: foodTypes.VEGETARISCH, filter: filterTypes.VEGETARISCH}
		
		case foodTypes.VEGAN:
		return {foodType: foodTypes.VEGAN, filter: filterTypes.VEGAN}
		
		default:
		return {foodType: "", filter: filterTypes.ALL};
	}
	}
					
	let foodOffers = [];
	try {
		const client = await clientPromise;
		const db = client.db("guckstDuEssen");

		const coll = db.collection("fhp");
	
		// const result = await coll.insertMany(docs);
		// console.log(result)

		const cursor = coll.find({week: getWeekNumber(new Date())});
		// await console.log(cursor)
		await cursor.forEach(console.log);

		if (true) {
			console.log("GETTING DATA FROM STUDENTENWERK")
			const response = await fetch(url)
			const xml = await response.text()
			
			// 0 = Heute
			let dateRef = (selectedWeekday - currentWeekday) < 0 ? 0 : selectedWeekday - currentWeekday;
			
			await parseString(xml, async function (err, result) {
				console.log("")
				console.log("")
				console.log("")
				console.log("")
				console.log("")
				console.log("parsing string")
				if(result.hasOwnProperty('p')){
					console.log('Database is temporary not responding')
				}
				if(result.menu.datum.length == 0){
					console.log("Fatal error in FH XML database")
				}

				// Day which the food is fetched for
				// This is seemingly not updated on Route Pushes
				let day = result.menu.datum[dateRef];
				console.log(day)
				result.menu.datum.forEach((day, index) => {
					// Checks if the dataset for today is empty
					if(day.angebotnr === 'undefined' || day.angebotnr == undefined) {
						
					} else {
						// Fetches the food offers for the selected day
						var angebote = [];
						if(day.angebotnr?.length !== 0 && day.angebotnr !== undefined) {
							for (let i = 0; i < day.angebotnr.length; i++){
								var ref = day.angebotnr[i];
						
								if(ref.labels[0].length == 0) {		
									let emptyLabel = { label : { 0 : 'empty'}}
						
									ref.labels[0] = emptyLabel;
								}	
						
								// Angebot vorhanden
								if(ref.preis_s[0] !== '' && ref.beschreibung[0] !== "" && ref.beschreibung[0] !== ".") {
									let titel = ref.titel[0]
									let beschreibung
						
									// if(ref.beschreibung == '.') {
									// 	beschreibung = "Angebot nicht mehr verfügbar"
									// } else {
									// }
									beschreibung = ref.beschreibung[0]
		
									// Setting Nutrient Array
									let nutrients = ref.nutrients[0].nutrient ? ref.nutrients[0].nutrient : []
									
									// Check if Array is filled to calculate kcal
									if(nutrients.length !== 0) {
										let tempEnergy = nutrients[0].wert[0]
										let kcal = Math.round(nutrients[0].wert[0] * 0.2390057361)
										// nutrients.splice(1, 0,  {name: ["Energiewert (Kcal)"], wert: [kcal], einheit: ["kcal"]})
										// nutrients[0].wert[0] = `${tempEnergy} / ${kcal}`
		
										for (let i = 0; i < nutrients.length; i++) {
											const tempNutrient = nutrients[i];
											nutrients[i] = `${tempNutrient.name[0]}: ${tempNutrient.wert[0]} ${tempNutrient.einheit[0]}`
										}
		
										nutrients[0] = `Energie: ${tempEnergy} kJ / ${kcal} kcal`
									}
		
									angebote.push({
										titel,
										beschreibung,
										labels: foodTypeChecker(ref.labels[0].label[0].$?.name),
										preise: {
											preis_s: ref.preis_s,
											preis_m: ref.preis_m,
											preis_g: ref.preis_g
										},
										nutrients,
										week: getWeekNumber(new Date()),
										day: dateRef
									})
								} else {
									// Dont Push Angebnot into array
								}
							}
						}
					}
					if (angebote && angebote?.length !== 0) {
						// console.log(angebote)

						foodOffers = [...foodOffers, ...angebote]
					}
				})
				const dbResult = await coll.insertMany(foodOffers);
				console.log(dbResult.insertedIds);
			});
		} else {
			console.log("Database is not empty", await cursor.toArray().length)
		}

	} catch (e) {
		console.error(e)
	}

	const floatTimeToString = (floatTime) => {
		let hours = Math.floor(floatTime)
		let minutes = Math.round((floatTime - hours) * 60)
		if (minutes < 10) {
			minutes = "0" + minutes
		}
		return hours + ":" + minutes
	}

	const findObjectInArrayByKey = (array, key, value) => {
		for (var i = 0; i < array.length; i++) {
			if (array[i][key] === value) {
				return array[i];
			}
		}
		return null;
	}

	const openFrom = floatTimeToString(findObjectInArrayByKey(mensaData, 'url', context.query.mensa).opening)
	const openUntil = floatTimeToString(findObjectInArrayByKey(mensaData, 'url', context.query.mensa).closing)
console.log(openFrom, openUntil)
	const d = new Date();
  	const currentTime = d.getHours() + d.getMinutes()/60

	const open = currentTime >= openFrom && currentTime <= openUntil

	return {
	  props: {
		foodOffers,
		selectedWeekday,
		days,
		openingTimes: {
			openFrom,
			openUntil,
			open
		}
	  }
	}
}