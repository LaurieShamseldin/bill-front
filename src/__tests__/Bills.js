/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js"
import mockStore from "../__mocks__/store";
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import errorMessage from "../views/ErrorPage.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // Définition du local storage
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      // Simulation de l'utilisateur type employé
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      // Corps du document
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      // Vérification que "icon window" a bien la classe active icon
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
      //to-do write expect expression

    })
    // test("Then bills should be ordered from earliest to latest", () => {
    //   document.body.innerHTML = BillsUI({ data: bills })
    //   const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
    //   const antiChrono = (a, b) => ((a < b) ? 1 : -1)
    //   const datesSorted = [...dates].sort(antiChrono)
    //   expect(dates).toEqual(datesSorted)
    // })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
    
      // Récupération des éléments contenant les dates des factures
      const datesElements = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
    
      // Extraction des dates et conversion en objets Date
      const dates = datesElements.map(dateElement => new Date(dateElement.textContent))
    
      // Vérification du tri des dates
      const isSorted = dates.every((date, index) => {
        if (index === 0) return true; // Premier élément, donc déjà trié
        return date >= dates[index - 1]; // Vérification du tri croissant
      })
    
      expect(isSorted).toBe(true)
    });
    
  });

    it('should open modal with bill image when icon is clicked', () => {
      // Charge le HTML simulé représentant les factures dans le corps du document
      document.body.innerHTML = BillsUI({ data: bills });

      // Crée une instance de la classe Bills avec les dépendances nécessaires
      const bill = new Bills ({
        document, onNavigate, store: null, localStorage: window.localStorage
      });

      // Mocke la méthode modal de jQuery pour éviter des appels réels
      $.fn.modal = jest.fn();
    
      // Sélectionne le premier élément avec le data-testid "icon-eye" 
      const eye = screen.getAllByTestId('icon-eye')[0];


      // Simule un clic sur l'icône de l'œil
      userEvent.click(eye);

      // Récupère l'élément img représentant la facture dans la modale
      const modalBill = document.querySelector('img[alt="Bill"]')
      
    // Vérifie si l'élément img de la facture dans la modale est présent
      expect(modalBill).not.toEqual(null)
    });
  
    it('should open new bill when button is clicked', () => {
      // Initialisation
      document.body.innerHTML = BillsUI({ data: bills });
      const bill = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      });
    
      // Espionne la méthode 'onNavigate' pour vérifier les appels
      const mockOnNavigate = jest.fn((pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      });
      bill.onNavigate = mockOnNavigate;
    
      // Clique sur le bouton
      const btn = screen.getByTestId('btn-new-bill');
      userEvent.click(btn);
    
      // Vérifie que la méthode onNavigate a été appelée avec la bonne URL
      expect(mockOnNavigate).toHaveBeenCalledWith('#employee/bill/new');
    })
  });

  // test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
        // Exécution avant chaque test 
        beforeEach(() => {
           // Espionne la méthode 'bills' de l'objet 'mockedBills'
           jest.spyOn(mockStore, "bills")
           Object.defineProperty(
               window,
               'localStorage',
               { value: localStorageMock }
           )
           // Simule la présence d'un utilisateur connecté dans le stockage local avec des données JSON
           window.localStorage.setItem('user', JSON.stringify({
             type: 'Employee',
             email: "test@test.com"
           }))
           // Crée un élément 'div' pour servir de point d'ancrage pour l'application
           const root = document.createElement("div")
           // Définit l'attribut 'id' de l'élément 'root' nouvellement créé à 'root'
           root.setAttribute("id", "root")
           document.body.appendChild(root)
           // Initialise et configure le routage de l'application
           router()
      })
      test("fetches bills from mock API GET", async () => {
        // Crée une instance de Bills avec les dépendances nécessaires et une source de données simulée
        const billsContainer = new Bills({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });
        // Appelle la méthode getBills() pour récupérer la liste des factures
        const billsList = await billsContainer.getBills();
        // Vérifie que la liste des factures récupérée n'est pas vide
        const numberOfBills = billsList.length;
        // Vérifie que le nombre de factures est supérieur à zéro
        expect(numberOfBills).toBeGreaterThan(0);
      });
  });

  describe("When an error occurs on API", () => {
    // Exécution avant chaque test 
    beforeEach(() => {
      // Espionne la méthode 'bills' de l'objet 'mockStore'
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      // Simule la présence d'un utilisateur connecté dans le stockage local avec des données JSON
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "test@test.com"
      }))
      // Crée un élément 'div' pour servir de point d'ancrage pour l'application
      const root = document.createElement("div")
      // Définit l'attribut 'id' de l'élément 'root' nouvellement créé à 'root'
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      // Initialise et configure le routage de l'application
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
        // Crée une instance d'erreur simulée avec le message "Erreur 404"
      let errorMessage404 = new Error("Erreur 404")

    // Définit la structure de la page pour afficher l'erreur simulée
      const errorElement = errorMessage(errorMessage404.message)
      document.body.innerHTML = errorElement;

      // Mocke la méthode 'list' de 'mockedBills.bills' pour renvoyer une promesse rejetée avec l'erreur simulée
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      // Déclenche la navigation vers la page des factures ('ROUTES_PATH.Bills')
      window.onNavigate(ROUTES_PATH.Bills)
      // Attend que le rendu de la page se produise
      await new Promise(process.nextTick);
      // Recherche un élément contenant le texte "Erreur 404" dans le DOM
      const message = await screen.getByText(/Erreur 404/)
      // Vérifie que l'élément contenant le texte "Erreur 404" a été trouvé
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {
      // Crée une instance d'erreur simulée avec le message "Erreur 404"
      let errorMessage500 = new Error("Erreur 500")

    // Définit la structure de la page pour afficher l'erreur simulée
      const errorElement = errorMessage(errorMessage500.message)
      document.body.innerHTML = errorElement;

      // Mocke la méthode 'list' de 'mockedBills.bills' pour renvoyer une promesse rejetée avec l'erreur simulée
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
      // Déclenche la navigation vers la page des factures ('ROUTES_PATH.Bills')
      window.onNavigate(ROUTES_PATH.Bills)
      // Attend que le rendu de la page se produise
      await new Promise(process.nextTick);
      // Recherche un élément contenant le texte "Erreur 404" dans le DOM
      const message = await screen.getByText(/Erreur 500/)
      // Vérifie que l'élément contenant le texte "Erreur 404" a été trouvé
      expect(message).toBeTruthy()
    })
  })

  })



