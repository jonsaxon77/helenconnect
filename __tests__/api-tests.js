import { expect } from "chai";
import sinon from "sinon";
import sql from "mssql";
import {
  getReferrals,
  getReferral,
  addReferral,
} from "../controllers/referrals.js";

describe("Referrals API (with Sinon Mocks", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("getReferral", () => {
    it("should get a single referral by ID", async () => {
      const req = { params: { id: 3 } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      const mockData = [{ Id: 1 }, { Id: 2 }, { Id: 3 }];

      const mockRequest = {
        input: sinon.stub().returnsThis(),
        query: sinon.stub().callsFake((queryString) => {
          const idValue = req.params.id;
          const filteredData = mockData.filter(
            (referral) => referral.Id === parseInt(idValue, 10)
          );
          return Promise.resolve({ recordset: filteredData });
        }),
      };

      sandbox.stub(sql, "Request").returns(mockRequest);

      const result = await getReferral(req, res);

      sinon.assert.calledOnce(sql.Request);
      sinon.assert.calledWith(mockRequest.input, "id", sql.Int, 3);
      sinon.assert.calledWith(
        mockRequest.query,
        "SELECT * FROM contactCaresReferrals WHERE Id = @id"
      );

      sinon.assert.calledWith(res.status, 200);
      sinon.assert.calledWith(res.json, { recordset: [mockData[2]] });

      expect(result).to.deep.equal({ recordset: [mockData[2]] });
    });
  });

  describe("getReferrals", () => {
    it("should get referrals with the specified isProcessed status", async () => {
      const req = { params: { isProcessed: 0 } };
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      const mockData = [
        { Id: 1, IsProcessed: 0 },
        { Id: 2, IsProcessed: 1 },
        { Id: 3, IsProcessed: 0 },
        { Id: 4, IsProcessed: 1 },
        { Id: 5, IsProcessed: 0 },
        { Id: 6, IsProcessed: 0 },
        { Id: 7, IsProcessed: 1 },
      ];

      const mockRequest = {
        input: sinon.stub().returnsThis(),
        query: sinon.stub().callsFake((queryString) => {
          const isProcessedValue = req.params.isProcessed;
          const filteredData = mockData.filter(
            (referral) =>
              referral.IsProcessed === parseInt(isProcessedValue, 10)
          );
          return Promise.resolve({ recordset: filteredData });
        }),
      };

      sandbox.stub(sql, "Request").returns(mockRequest);

      await getReferrals(req, res);

      sinon.assert.calledOnce(sql.Request);
      sinon.assert.calledWith(mockRequest.input, "isProcessed", sql.Int, 0);
      sinon.assert.calledWith(
        mockRequest.query,
        "SELECT * FROM contactCaresReferrals WHERE IsProcessed = @isProcessed"
      );
      sinon.assert.calledWith(res.status, 200);
      sinon.assert.calledWith(res.json, {
        count: 4,
        records: [
          { Id: 1, IsProcessed: 0 },
          { Id: 3, IsProcessed: 0 },
          { Id: 5, IsProcessed: 0 },
          { Id: 6, IsProcessed: 0 },
        ],
      });
    });
  });

  describe("addReferral", () => {
    it("should add a new referral and return its ID", async () => {
      const req = {
        body: {
          Area: "Reablement",
          ContactType: "Request for Reablement Assessment / Service",
          Outcomes: "Progress to New Referral / Link to Existing Referral",
          Reason: "Contact Cares MDT",
          ReportersName: "Joe Bloggs",
          ReportersAddress: "1 The Street, The Town, The County, WA11 1PP",
          ReportersRelationship: "Professional",
          ClientsFirstName: "Jane",
          ClientsLastName: "Doe",
          ClientsDateOfBirth: "01/01/1977",
          ClientsAddress: "5 The Street, The Town, The County, WA11 1PP",
          FormData: {},
          IsOnBehalfOf: 1,
          IsProcessed: 0,
        },
      };
      const res = {
        status: sinon.stub().returnsThis(),
        location: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      const mockResult = {
        recordset: [{ referralId: 10 }],
      };

      sandbox.stub(sql, "query").resolves(mockResult);

      await addReferral(req, res);

      sinon.assert.calledOnce(sql.query);
      sinon.assert.calledWith(res.status, 201);
      sinon.assert.calledWith(res.location, "/api/v1/referrals/10");
      sinon.assert.calledWith(res.json, {
        id: 10,
        Area: "Reablement",
        ContactType: "Request for Reablement Assessment / Service",
        Outcomes: "Progress to New Referral / Link to Existing Referral",
        Reason: "Contact Cares MDT",
        ReportersName: "Joe Bloggs",
        ReportersAddress: "1 The Street, The Town, The County, WA11 1PP",
        ReportersRelationship: "Professional",
        ClientsFirstName: "Jane",
        ClientsLastName: "Doe",
        ClientsDateOfBirth: "01/01/1977",
        ClientsAddress: "5 The Street, The Town, The County, WA11 1PP",
        FormData: {},
        IsOnBehalfOf: 1,
        IsProcessed: 0,
      });
    });
  });
});
