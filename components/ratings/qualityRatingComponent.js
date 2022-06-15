import { useState } from "react"

export const QualityRatingComponent = ({handleUserQualityRating, qualityRating, userQualityRating, isClickable}) => {
    const amountOfStars = 5

    const userRatingColor = "#88E2A1"
    const ratingColor = "#000"
    const inactiveColor = "#DBDBDB"

    const reviewDescriptions = {
        0: "Keine Bewertungen",
        1: "Schlecht",
        2: "Nicht soo super",
        3: "Durchschnittlich",
        4: "Gut",
        5: "Echt gut"
    }

    return (
        <div className="quality-rating-component">
            <p>
                Bewertung
            </p>
            <div className="quality-rating-component__body flex">
                {
                    [...Array(amountOfStars)].map((_, index) => {
                        return (
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" onClick={() => isClickable ? handleUserQualityRating(index+1) : null}><path d="M9.55706 0.846068C9.74421 0.488621 10.2558 0.488621 10.443 0.846068L12.8792 5.49937C12.9497 5.6339 13.0774 5.72913 13.2265 5.75821L18.2594 6.73997C18.6417 6.81455 18.7957 7.27832 18.5339 7.56676L14.9933 11.4678C14.8954 11.5757 14.8494 11.721 14.8674 11.8656L15.5279 17.1685C15.5772 17.5637 15.1672 17.855 14.8102 17.6785L10.2216 15.4096C10.082 15.3405 9.91808 15.3405 9.7784 15.4096L5.18989 17.6785C4.8329 17.855 4.42287 17.5637 4.4721 17.1685L5.13267 11.8656C5.15068 11.721 5.1047 11.5757 5.00675 11.4678L1.46612 7.56676C1.20433 7.27832 1.35831 6.81455 1.74063 6.73997L6.77357 5.75821C6.92262 5.72913 7.05037 5.6339 7.12081 5.49937L9.55706 0.846068Z" 
                            fill={index+1 <= userQualityRating ? userRatingColor : index+1 <= qualityRating ? ratingColor : inactiveColor}/></svg>
                        )
                    })
                }
            </div>
            <p>
                {reviewDescriptions[qualityRating]}
            </p>
        </div>
    )
}