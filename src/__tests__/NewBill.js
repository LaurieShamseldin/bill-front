/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import BillsUI from "../views/BillsUI.js";
import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import store from "../app/Store.js";

// Cette ligne permet de simuler le module '../app/store' en remplaçant son importation par le contenu de 'mockStore'.
// Ainsi, lors des tests Jest, toutes les références à '../app/store' utiliseront en réalité 'mockStore'.
jest.mock("../app/store", () => mockStore);


const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("When i send information with correct format", () => {
      test("Then the submit should success", async () => {
        const html = NewBillUI();
        document.body.innerHTML = html;
        const newBill1 = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage
        });
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "test@test.com"
        }))
        const formNewBill = screen.getByTestId("form-new-bill");
        expect(formNewBill).toBeTruthy();
        const handleSubmit = jest.fn((event) => newBill1.handleSubmit(event));
        formNewBill.addEventListener("submit", handleSubmit);
        fireEvent.submit(formNewBill);
        expect(handleSubmit).toHaveBeenCalled();
        await waitFor(() => screen.getByTestId("btn-new-bill"));
      });
    });

    describe("When an error occurs", () => {
      test("should fail with 500 message error", async () => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "test@test.com"
          })
        );
        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        const html = BillsUI({ error: "Erreur 500" });
        document.body.innerHTML = html;

        const message = await screen.getByText(/Erreur 500/);

        expect(message).toBeTruthy();
      });
    });
  });

  test("Then the file change", () => {
    const html = NewBillUI();
    document.body.innerHTML = html;

    const newBill1 = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage
    });

    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "test@test.com"
    }))

    const file = new File(["image"], "image.jpg", { type: "image/jpg" });
    const handleChangeFile = jest.fn((e) => newBill1.handleChangeFile(e));
    const billFile = screen.getByTestId("file");
    billFile.addEventListener("change", handleChangeFile);
    userEvent.upload(billFile, file);
    expect(billFile.files[0].name).toBeDefined();
    expect(handleChangeFile).toBeCalled();
  });

  describe("When i send information with an other format", () => {
    test("Then the file is not in the correct format.", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBill1 = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      });

      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "test@test.com"
      }))

      const incorrectFile = new File(["text"], "incorrectFile.txt", { type: "image/gif" });

      const billFile = screen.getByTestId("file");
      const errorFile = screen.getByTestId("error-file"); 

      const handleChangeFile = jest.fn((e) => newBill1.handleChangeFile(e));
      billFile.addEventListener("change", handleChangeFile);
      userEvent.upload(billFile, incorrectFile);

      expect(errorFile.classList.contains("hidden")).toBe(false);
      expect(handleChangeFile).toHaveBeenCalledTimes(1);
    });
  });
});
