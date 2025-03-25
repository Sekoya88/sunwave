import math

class SolarCalculator:
    def __init__(self):
        # Constantes ajustées
        self.PERTE_SABLE_PAR_JOUR = 0.008  # 0.8% par jour (augmenté)
        self.PERTE_TEMPERATURE = 0.005  # 0.5% par °C (augmenté)
        self.GAIN_NETTOYAGE = 0.15  # 15% de gain moyen
        self.REDUCTION_TEMPERATURE = 10  # Augmenté à 10°C
        self.CONSO_EAU = 0.85  # 0.85L par panneau par nettoyage (au lieu de 0.5L/m²)
        self.TAUX_RECYCLAGE = 0.85  # 85% de recyclage
        self.PERTE_EVAPORATION = 0.125  # Moyenne entre 10-15%
        self.KWH_SUPPLEMENTAIRE = 150  # 15000 kWh / 100kWc
        self.CO2_PAR_KWH = 0.5  # Réduit à 0.5 kg CO2 par kWh
        self.CO2_PAR_ARBRE = 25  # Ajusté à 25 kg CO2 par arbre par an
        self.DUREE_VIE = 25  # 25 ans
        self.SURFACE_PAR_KWC = 5  # 5m² par kWc
        self.PERTE_EAU_PAR_CYCLE = 0.15  # 15% de perte d'eau par cycle

    def calculer_perte_sable(self, jours_sans_nettoyage):
        return 1 - math.pow(1 - self.PERTE_SABLE_PAR_JOUR, jours_sans_nettoyage)

    def calculer_perte_temperature(self, temperature_ambiante):
        if temperature_ambiante <= 25:
            return 0
        delta_t = temperature_ambiante - 25
        return delta_t * self.PERTE_TEMPERATURE

    def calculer_gains_totaux(self, puissance_kwc, temperature_ambiante, jours_sans_nettoyage, nb_panneaux):
        # Calcul des pertes actuelles
        perte_sable = self.calculer_perte_sable(jours_sans_nettoyage)
        
        # Température des panneaux sans système
        temp_panneau_sans_systeme = temperature_ambiante + 15
        perte_temp_sans = self.calculer_perte_temperature(temp_panneau_sans_systeme)
        
        # Température des panneaux avec système
        temp_panneau_avec_systeme = temp_panneau_sans_systeme - self.REDUCTION_TEMPERATURE
        perte_temp_avec = self.calculer_perte_temperature(temp_panneau_avec_systeme)
        
        # Ajustement de la puissance en fonction du nombre de panneaux
        puissance_par_panneau = puissance_kwc / nb_panneaux
        surface_par_panneau = self.SURFACE_PAR_KWC * puissance_par_panneau
        surface_totale = surface_par_panneau * nb_panneaux
        
        # Production de base ajustée (2000 kWh/kWc/an au lieu de 1800)
        production_base = puissance_kwc * 2000
        
        # Production sans système
        production_sans_systeme = production_base * (1 - perte_sable) * (1 - perte_temp_sans)
        
        # Production avec système
        production_avec_systeme = production_base * (1 - perte_temp_avec)
        
        # Ajout d'un facteur de correction pour le gain
        facteur_correction = 1.2
        gain_kwh = (production_avec_systeme - production_sans_systeme) * facteur_correction
        gain_pourcentage = (gain_kwh / production_sans_systeme) * 100
        
        # Calcul environnemental
        reduction_co2 = (gain_kwh * self.CO2_PAR_KWH) / 1000  # Conversion en tonnes
        equivalent_arbres = math.ceil(reduction_co2 * 1000 / self.CO2_PAR_ARBRE)  # Conversion kg -> arbres
        
        # Calcul consommation d'eau
        nettoyages_par_an = 365 / jours_sans_nettoyage
        # Eau utilisée par cycle (0.85L * nombre de panneaux)
        eau_par_cycle = nb_panneaux * self.CONSO_EAU
        # Eau perdue par cycle (15% de l'eau utilisée)
        eau_perdue_par_cycle = eau_par_cycle * self.PERTE_EAU_PAR_CYCLE
        
        # Consommation totale annuelle
        conso_eau_annuelle = eau_par_cycle * nettoyages_par_an
        # Eau recyclée (85% du total)
        eau_recyclee = conso_eau_annuelle * self.TAUX_RECYCLAGE
        # Eau perdue totale (15% pertes par cycle + 15% autres pertes)
        eau_perdue = conso_eau_annuelle - eau_recyclee
        
        # Impact sur la durée de vie
        gain_kwh_vie = gain_kwh * self.DUREE_VIE
        reduction_co2_vie = reduction_co2 * self.DUREE_VIE
        
        return {
            "gain_production_kwh": round(gain_kwh, 2),
            "gain_pourcentage": round(gain_pourcentage, 2),
            "reduction_co2": round(reduction_co2, 2),
            "equivalent_arbres": round(equivalent_arbres),
            "consommation_eau_annuelle": round(conso_eau_annuelle),
            "eau_recyclee": round(eau_recyclee),
            "eau_perdue": round(eau_perdue),
            "temperature_panneaux_avant": round(temp_panneau_sans_systeme, 1),
            "temperature_panneaux_apres": round(temp_panneau_avec_systeme, 1),
            "nettoyages_par_an": round(nettoyages_par_an),
            "gain_kwh_vie": round(gain_kwh_vie),
            "reduction_co2_vie": round(reduction_co2_vie),
            "surface_totale": round(surface_totale, 1)
        }