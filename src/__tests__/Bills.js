/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import mockStore from "../__mocks__/store";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import errorMessage from "../views/ErrorPage.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const datesElements = screen.getAllByText(
        /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
      );
      const dates = datesElements.map(
        (dateElement) => new Date(dateElement.textContent)
      );
      const isSorted = dates.every((date, index) => {
        if (index === 0) return true;
        return date >= dates[index - 1];
      });
      expect(isSorted).toBe(true);
    });
  });

  it("should open modal with bill image when icon is clicked", () => {
    document.body.innerHTML = BillsUI({ data: bills });
    const bill = new Bills({
      document,
      onNavigate,
      store: null,
      localStorage: window.localStorage,
    });
    $.fn.modal = jest.fn();
    const eye = screen.getAllByTestId("icon-eye")[0];
    userEvent.click(eye);
    const modalBill = document.querySelector('img[alt="Bill"]');
    expect(modalBill).not.toEqual(null);
  });

  it("should open new bill when button is clicked", () => {
    document.body.innerHTML = BillsUI({ data: bills });
    const bill = new Bills({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });
    const mockOnNavigate = jest.fn((pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    });
    bill.onNavigate = mockOnNavigate;
    const btn = screen.getByTestId("btn-new-bill");
    userEvent.click(btn);
    expect(mockOnNavigate).toHaveBeenCalledWith("#employee/bill/new");
  });
});

describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "test@test.com" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });

    test("fetches bills from mock API GET", async () => {
      const billsContainer = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      const billsList = await billsContainer.getBills();
      const numberOfBills = billsList.length;
      expect(numberOfBills).toBeGreaterThan(0);
    });
  });

  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "test@test.com" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });

    test("fetches bills from an API and fails with 404 message error", async () => {
      let errorMessage404 = new Error("Erreur 404");
      const errorElement = errorMessage(errorMessage404.message);
      document.body.innerHTML = errorElement;
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });

    test("fetches messages from an API and fails with 500 message error", async () => {
      let errorMessage500 = new Error("Erreur 500");
      const errorElement = errorMessage(errorMessage500.message);
      document.body.innerHTML = errorElement;
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });
      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});
