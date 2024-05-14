import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { query, where, getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase/config';

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
                    setClientsGained(clientsData.gained);
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
            <div style={{display: "flex", flexDirection: "column", alignItems: "center", paddingLeft: "30px", paddingRight: "30px", gap: "30px"}}>
                <div>
                    <h1>Dzień dobry<span style={{fontWeight: "bold"}}>{clientsName ? `, ${clientsName}` : ''}</span>!</h1>

                    <div style={{}}>
                    <p>Cieszymy się jesteś z nami. To dobra decyzja!</p>
                    <p>Oto korzyści z uczestnictwa:</p>
                    <p>1. Za {loyaltyRulesValue1 === 1 ? 'każdy' : 'każde'} {loyaltyRulesValue1} zł {loyaltyRulesValue1 === 1 ? 'wydany' : 'wydane'} w naszym sklepie,
                        otrzymujesz {loyaltyRulesPoints1} {loyaltyRulesPoints1 === 1 ? 'punkt' : (loyaltyRulesPoints1 % 10 >= 2 && loyaltyRulesPoints1 % 10 <= 4 && (loyaltyRulesPoints1 % 100 < 10 || loyaltyRulesPoints1 % 100 >= 20)) ? 'punkty' : 'punktów'}.</p>
                    <p>2. Punkty możesz następnie wykorzystać podczas kolejnych zakupów.
                        {loyaltyRulesPoints2 === 1 ? ' Każdy' : ' Każde'} {loyaltyRulesPoints2} {loyaltyRulesPoints2 === 1 ? 'punkt' : (loyaltyRulesPoints2 % 10 >= 2 && loyaltyRulesPoints2 % 10 <= 4 && (loyaltyRulesPoints2 % 100 < 10 || loyaltyRulesPoints2 % 100 >= 20)) ? 'punkty' : 'punktów'} to {loyaltyRulesValue2} zł.</p>
                    <p>3. Klienci, których łączna wartość zakupów to co najmniej {loyaltyRulesValue3} zł otrzymują stały
                        rabat w wysokości {loyaltyRulesPercentage3}% na wszystkie nasze produkty.</p>
                    <p>{(clientsTotalPoints > 0 && clientsGained > 0) ? `Obecnie masz ${clientsTotalPoints} {clientsTotalPoints === 1 ? 'punkt' : (clientsTotalPoints % 10 >= 2 && clientsTotalPoints % 10 <= 4 && (clientsTotalPoints % 100 < 10 || clientsTotalPoints % 100 >= 20)) ? 'punkty' : 'punktów'}, co stanowi równowartość ${clientsGained} zł.` : "Obecnie nie masz jeszcze żadnych punktów."}</p>
                    <p>{clientsDiscount === true ? `Dodatkowo otrzymujesz rabat w wysokości ${loyaltyRulesPercentage3}% na nasze produkty.` : `Do stałego rabatu na nasze produkty brakuje Ci ${clientDiscountValueMissing} zł.`} </p>

                    <p>Dziękujemy, że jesteś z nami!</p>
                    <p>Pozdrawiamy,</p>
                    <p>Zespół ABC Limited</p>
                    </div>

                </div>

            </div>

        </>
    );
};
