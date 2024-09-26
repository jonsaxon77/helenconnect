import { use, expect } from "chai";
import chaiHttp from "chai-http";
import sinon from "sinon";
import sql from "mssql";
import { getReferrals } from "../controllers/referrals.js";

describe("Referrals API (with Sinon Mocks", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  // Test for getReferrals
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
          // Simulate the database filtering logic
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
          { Id: 6, IsProcessed: 0 }
        ],
      });
    });
  });
});
