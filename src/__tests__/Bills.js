/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

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

  
})
