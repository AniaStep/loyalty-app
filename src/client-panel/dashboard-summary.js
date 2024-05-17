import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import {
    query,
    where,
    getDocs,
    collection
} from 'firebase/firestore';
import { db } from '../firebase/config';
import LoyaltyIcon from '@mui/icons-material/Loyalty';


export const WelcomeInfoCard = () => {
    const location = useLocation();
    const adminId = location.pathname.split('/')[2];
    const clientId = location.pathname.split('/')[3];
    const [loyaltyRulesValue1, setLoyaltyRulesValue1] = useState(0);
    const [loyaltyRulesValue2, setLoyaltyRulesValue2] = useState(0);
    const [loyaltyRulesValue3, setLoyaltyRulesValue3] = useState(0);
    const [loyaltyRulesPoints1, setLoyaltyRulesPoints1] = useState(0);
    const [loyaltyRulesPoints2, setLoyaltyRulesPoints2] = useState(0);
    const [loyaltyRulesPercentage3, setLoyaltyRulesPercentage3] = useState(0);
    const [clientsTotalPoints, setClientsTotalPoints] = useState(0);
    const [clientsTotalValueNum, setClientsTotalValueNum] = useState(0);
    const [clientsName, setClientsName] = useState("");
    const [clientsDiscount, setClientsDiscount] = useState(false);
    const [clientsGained, setClientsGained] = useState(0);
    const [clientDiscountValueMissing, setClientDiscountValueMissing] = useState(0);

    // Effect to fetch client data
    useEffect(() => {
        const fetchClientData = async () => {
            try {
                const loyaltyRulesQuery = query(collection(db, 'loyaltyRules'), where('adminId', '==', adminId));
                const loyaltyRulesSnapshot = await getDocs(loyaltyRulesQuery);
                const loyaltyRulesData = loyaltyRulesSnapshot.docs.map(doc => doc.data())[0];

                if (loyaltyRulesData) {
                    setLoyaltyRulesValue1(loyaltyRulesData.value1);
                    setLoyaltyRulesValue2(loyaltyRulesData.value2);
                    setLoyaltyRulesValue3(loyaltyRulesData.value3);
                    setLoyaltyRulesPoints1(loyaltyRulesData.points1);
                    setLoyaltyRulesPoints2(loyaltyRulesData.points2);
                    setLoyaltyRulesPercentage3(loyaltyRulesData.percentage3);
                }

                const clientsQuery = query(collection(db, 'clients'), where('adminId', '==', adminId), where('clientId', '==', clientId));
                const clientsSnapshot = await getDocs(clientsQuery);
                const clientsData = clientsSnapshot.docs.map(doc => doc.data())[0];

                if (clientsData) {
                    setClientsName(clientsData.name);
                    setClientsTotalPoints(clientsData.totalPoints);
                    setClientsTotalValueNum(clientsData.totalValueNum);
                    setClientsDiscount(clientsData.discount);
                    setClientsGained(loyaltyRulesData.points2 > 0 ? (clientsData.totalPoints / loyaltyRulesData.points2 * loyaltyRulesData.value2) : 0);
                    setClientDiscountValueMissing(clientsData.totalValueNum > 0 ? loyaltyRulesData.value3 - clientsData.totalValueNum : loyaltyRulesData.value3);
                }

            } catch (error) {
                console.error(error);
            }
        };

        fetchClientData();
    }, [adminId]);


    return (
        <>
            <div className="welcome-info-card">
                <div style={{width: "500px", textAlign: "left"}}>

                    <h1>Dzień dobry
                        <span style={{fontWeight: "bold"}}>{clientsName ? `, ${clientsName}` : ''}</span>!
                    </h1>

                    <p>Cieszymy się jesteś z nami. To dobra decyzja!</p>

                    {(loyaltyRulesValue1 > 0 || loyaltyRulesPercentage3 > 0) ? (
                            <p>Oto korzyści z uczestnictwa:</p>
                        )
                        : ""
                    }

                    {loyaltyRulesValue1 > 0 ? (
                            <div className="benefits">
                                <LoyaltyIcon/>
                                <p>
                                    Za {loyaltyRulesValue1 === 1 ? 'każdy ' : 'każde '}
                                    <span
                                        style={{fontWeight: "bold"}}>{loyaltyRulesValue1} zł</span> {loyaltyRulesValue1 === 1 ? 'wydany' : 'wydane'} w
                                    naszym sklepie,
                                    otrzymujesz <span
                                    style={{fontWeight: "bold"}}>{loyaltyRulesPoints1} {loyaltyRulesPoints1 === 1 ? 'punkt' : (loyaltyRulesPoints1 % 10 >= 2 && loyaltyRulesPoints1 % 10 <= 4 && (loyaltyRulesPoints1 % 100 < 10 || loyaltyRulesPoints1 % 100 >= 20)) ? 'punkty' : 'punktów'}</span>.
                                </p>
                            </div>
                        )
                        : ""
                    }

                    {(loyaltyRulesValue1 > 0 && loyaltyRulesValue2 > 0) ? (
                            <div className="benefits">
                                <LoyaltyIcon/>
                                <p>
                                    Punkty możesz następnie wykorzystać podczas kolejnych zakupów.
                                    {loyaltyRulesPoints2 === 1 ? ' Każdy' : ' Każde'} <span
                                    style={{fontWeight: "bold"}}>{loyaltyRulesPoints2} {loyaltyRulesPoints2 === 1 ? 'punkt' : (loyaltyRulesPoints2 % 10 >= 2 && loyaltyRulesPoints2 % 10 <= 4 && (loyaltyRulesPoints2 % 100 < 10 || loyaltyRulesPoints2 % 100 >= 20)) ? 'punkty' : 'punktów'}</span> to <span
                                    style={{fontWeight: "bold"}}>{loyaltyRulesValue2} zł.</span>
                                </p>
                            </div>
                        )
                        : ""
                    }

                    {loyaltyRulesPercentage3 > 0 ? (
                            <div className="benefits">
                                <LoyaltyIcon/>
                                <p>
                                    Klienci, których łączna wartość zakupów to co najmniej <span
                                    style={{fontWeight: "bold"}}>{loyaltyRulesValue3} zł </span>otrzymują stały
                                    rabat w wysokości<span
                                    style={{fontWeight: "bold"}}> {loyaltyRulesPercentage3}% </span> na
                                    wszystkie nasze produkty.
                                </p>
                            </div>
                        )
                        : ""
                    }

                    <p>
                        {clientsTotalPoints > 0 ? (
                            <>Obecnie masz <span
                                style={{fontWeight: "bold"}}>{clientsTotalPoints}</span> {clientsTotalPoints === 1 ? 'punkt' : (clientsTotalPoints % 10 >= 2 && clientsTotalPoints % 10 <= 4 && (clientsTotalPoints % 100 < 10 || clientsTotalPoints % 100 >= 20)) ? 'punkty' : 'punktów'},
                                co stanowi równowartość <span
                                    style={{fontWeight: "bold"}}>{clientsGained}</span> zł.</>
                        ) : loyaltyRulesPoints2 === 0 || loyaltyRulesPoints1 === 0 ?
                            "" :
                            "Obecnie nie masz jeszcze żadnych punktów."
                        }
                    </p>

                    <p>
                        {clientsDiscount === true && loyaltyRulesPercentage3 > 0 ? (
                            <>Dodatkowo otrzymujesz rabat w wysokości <span
                                style={{fontWeight: "bold"}}>{loyaltyRulesPercentage3}%</span> na nasze produkty.</>
                        ) : clientDiscountValueMissing > 0 && loyaltyRulesPercentage3 > 0 ? (
                            <>Do stałego rabatu na nasze produkty brakuje Ci <span
                                style={{fontWeight: "bold"}}>{clientDiscountValueMissing}</span> zł.</>
                        ) : ""}
                    </p>

                    <p>Dziękujemy, że jesteś z nami!</p>
                    <p>Pozdrawiamy,</p>
                    <p style={{paddingBottom: "30px"}}>Zespół ABC Limited</p>
                </div>

            </div>

        </>
    );
};