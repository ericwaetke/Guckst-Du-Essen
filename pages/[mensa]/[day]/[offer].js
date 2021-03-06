import { useState, useEffect } from 'react';
import { useRouter } from 'next/router'
import Link from 'next/link'
var parseString = require("xml2js").parseString;
import 'tailwindcss/tailwind.css'
import Footer from '../../../components/footer';
import { mensaData } from '../..';
import { DayButton } from '../../../components/dayButton';
// import "../../assets/css/mensa.module.css"
import Modal from 'react-modal';

import clientPromise from '/lib/mongodb'
import foodTypeChecker from '/lib/foodTypeChecker';
import { getWeekdayByName } from '/lib/getWeekdayByName';
import { getWeekNumber } from '/lib/getWeekNumber';
import { getAllMensaDataFromSTW } from '/lib/getMensaData';
import { formatDate } from '/lib/formatDate';
import { ObjectId } from 'mongodb';
import { QualityRatingComponent } from '../../../components/ratings/qualityRatingComponent';
import { makeId } from '../../../lib/makeId';
import { getItem, setItem } from '../../../lib/localStorageHelper';
import postData, { saveQualityReviewToDB } from '../../../lib/postData';
import { NutrientOverview } from '../../../components/nutrients/nutrientOverview';
import { RatingOverview } from '../../../components/ratings/ratingOverview';
import { mensaClearName } from '../../../lib/mensaClearName';
import {calculateAverage} from "/lib/calculateAverage"
import { InteractiveQualityRatingComponent } from '../../../components/ratings/interactiveRatingComponents/interactiveQualityRatingComponent';

export default function Mensa(props) {
	const router = useRouter()
  	const { mensa } = router.query

	const offer = props.offer

	const [qualityRating, setQualityRating] = useState(
		offer.qualityRating ? calculateAverage(offer.qualityRating) : 0
	)
	console.log(offer.qualityRating)
	const [userQualityRating, setUserQualityRating] = useState(0)
	const handleUserQualityRating = async (rating) => {
        let sessionId = getItem("sessionId")
        if (!sessionId) {
            sessionId = makeId()
            setItem("sessionId", sessionId)
        }

        setUserQualityRating(rating)
		saveQualityReviewToDB(offer, rating, router.query.mensa, sessionId)
    }

	// Modal Stuff
	const [showRatingModal, setShowRatingModal] = useState(false)
	const openRatingModal = () => {
		setShowRatingModal(true)
	}
	const closeRatingModal = () => {
		setShowRatingModal(false)
	}


	return (
        <div className="space-y-6 break-words mx-5 mt-12">
			<Modal
				isOpen={showRatingModal}
				onRequestClose={() => console.log("request close")}
				className="modal"
				overlayClassName="bg-custom-white"
				ariaHideApp={false}
				// shouldCloseOnOverlayClick={true}
				style={{
					overlay: {
						backgroundColor: 'rgba(0, 0, 0, 0.5)'
					}
				}}
			>
				<div className='w-full h-full bg-custom-white bg-opacity-50 fixed top-0 left-0 backdrop-blur-md flex items-center justify-center'>
					<div className='bg-custom-white rounded-xl p-8 max-w-prose pointer-events-auto'>
						<p className='font-bold text-xl'>
							Essen bewerten
						</p>
						<p>
							{offer.beschreibung}
						</p>
						<InteractiveQualityRatingComponent handleUserQualityRating={handleUserQualityRating} userQualityRating={userQualityRating} />	
						<button className='bg-custom-green text-custom-black px-6 py-2 rounded-md' onClick={closeRatingModal}>Bewertung speichern!</button>
					</div>	
				</div>	
				</Modal>
			
			<div>
                <Link href={`/[mensa]/[day]/`} as={`/${mensa}/${router.query.day}/`}>
					<a className="p-6 pl-0 flex items-center gap-4">
						<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M11.1426 6.75C11.5568 6.75 11.8926 6.41421 11.8926 6C11.8926 5.58579 11.5568 5.25 11.1426 5.25V6.75ZM0.326533 5.46967C0.0336397 5.76256 0.0336397 6.23744 0.326533 6.53033L5.0995 11.3033C5.3924 11.5962 5.86727 11.5962 6.16016 11.3033C6.45306 11.0104 6.45306 10.5355 6.16016 10.2426L1.91752 6L6.16016 1.75736C6.45306 1.46447 6.45306 0.989592 6.16016 0.696699C5.86727 0.403806 5.3924 0.403806 5.0995 0.696699L0.326533 5.46967ZM11.1426 5.25L0.856863 5.25V6.75L11.1426 6.75V5.25Z" fill="black"/>
						</svg>
						<h2 className="text-sm font-medium inline text-center">Zur??ck zur Mensa {mensaClearName[mensa]}</h2>
					</a>
				</Link>

			</div>

			<div className="space-y-6 lg:space-y-0">
				<div className="flex-initial rounded-xl bg-custom-bg divide-y divide-solid divide-custom-divider">
					<div className="p-8">
						<p className="font-medium text-sm text-gray-400">{offer.titel}</p>
						<p className="text-2xl font-medium">{offer.beschreibung}</p>
						<div className="mt-9 flex justify-between flex-col xs:flex-row items-start gap-y-2">
							<p className="font-medium text-gray-400 text-sm"><span className="bg-custom-light-gray rounded-full py-1 px-4 text-black inline-block">{offer.preise.preis_s} ???</span> <span className='text-green-w7'>{offer.preise.preis_g} ???</span></p>
							{offer.labels.filter !== "all" && <p className="capitalize font-medium text-sm bg-custom-light-gray rounded-full py-1 px-4 inline-block">{offer.labels.filter}</p>}
						</div>
					</div>

					<RatingOverview ratingCount={offer.qualityRating ? offer.qualityRating.length : 0} handleUserQualityRating={handleUserQualityRating} qualityRating={qualityRating} userQualityRating={userQualityRating} openRatingModal={openRatingModal}/>
					<NutrientOverview nutrients={offer.nutrients} />

					<div className="py-4">
						<p className="px-8 pb-2 font-bold text-sm text-custom-black uppercase">Allergene</p>
						<div className="px-8 pb-4 text-sm font-serif">
								{offer.allergene.join(", ")}
							</div>
					</div>
				</div>
				<div className='flex items-center gap-2'>
					<p>Bitte stimmt nach dem Essen ab.</p>
					<svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M6.99365 12.5552C7.07829 12.5552 7.1735 12.5298 7.2793 12.479C7.38932 12.4282 7.493 12.3711 7.59033 12.3076C8.77523 11.5459 9.80143 10.7461 10.6689 9.9082C11.5407 9.07031 12.2157 8.20703 12.6938 7.31836C13.172 6.42969 13.4111 5.53467 13.4111 4.6333C13.4111 4.04932 13.3159 3.51611 13.1255 3.03369C12.9393 2.54704 12.6812 2.12809 12.3511 1.77686C12.021 1.42562 11.6359 1.15479 11.1958 0.964355C10.7557 0.769694 10.2817 0.672363 9.77393 0.672363C9.14339 0.672363 8.59326 0.833171 8.12354 1.15479C7.65804 1.47217 7.28141 1.89111 6.99365 2.41162C6.71436 1.89535 6.33984 1.4764 5.87012 1.15479C5.40039 0.833171 4.85026 0.672363 4.21973 0.672363C3.71191 0.672363 3.23796 0.769694 2.79785 0.964355C2.36198 1.15479 1.97689 1.42562 1.64258 1.77686C1.3125 2.12809 1.05225 2.54704 0.861816 3.03369C0.675618 3.51611 0.58252 4.04932 0.58252 4.6333C0.58252 5.53467 0.819499 6.42969 1.29346 7.31836C1.77165 8.20703 2.44661 9.07031 3.31836 9.9082C4.19434 10.7461 5.22477 11.5459 6.40967 12.3076C6.50277 12.3711 6.60433 12.4282 6.71436 12.479C6.82438 12.5298 6.91748 12.5552 6.99365 12.5552Z" fill="black"/>
					</svg>
				</div>
			</div>
			<Footer />
        </div>
    )
}

export async function getServerSideProps(context) {
	try {
		const client = await clientPromise;
		const db = client.db("guckstDuEssen");

		const coll = db.collection(context.query.mensa);

        const offerQuery = {_id: ObjectId(context.query.offer)}
        let offer = await coll.findOne(offerQuery)

        offer._id = offer._id.toString()

        return {
            props: {
                offer
            }
        }
	} catch (e) {
		console.error(e)

        return {
            props: {
                offer: null
            }
        }
	}

}