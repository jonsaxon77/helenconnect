// controllers/referrals.js
import { logger, pool } from '../shared.js'; // Import from shared.js
import sql from 'mssql';

export async function getReferrals(req, res) {
    try {
        const request = new sql.Request(pool);
        request.input("isProcessed", sql.Int, req.params.isProcessed);

        const result = await request.query(
            "SELECT * FROM contactCaresReferrals WHERE IsProcessed = @isProcessed"
        );

        res.status(200).json({
            count: result.recordset.length,
            records: result.recordset,
        });
    } catch (err) {
        logger.error(`ReferralCtrl:: getReferrals(): Error ${err}`);
        res.status(500).json({ message: err.message });
    }
}

export async function getReferral(req, res) {
    try {
        const request = new sql.Request(pool);
        request.input("id", sql.Int, req.params.id);

        const result = await request.query(
            "SELECT * FROM contactCaresReferrals WHERE Id = @id"
        );

        res.status(200).json(result.recordset); // Send the first record (if found)
    } catch (err) {
        logger.error(`ReferralCtrl:: getReferral(): Error ${err}`);
        res.status(500).json({ message: err.message });
    }
}

export async function addReferral(req, res) {
  const { 
      Area, 
      ClientsAddress, 
      ClientsContactNumber, 
      ClientsDateOfBirth, 
      ClientsFirstName, 
      ClientsLastName, 
      ContactType, 
      FormData, 
      IsOnBehalfOf, 
      IsProcessed, 
      Outcomes, 
      Reason, 
      ReportersAddress, 
      ReportersContactNumber, 
      ReportersName, 
      ReportersRelationship 
  } = req.body;

  try {
      const request = new sql.Request(pool);

      request.input('Area', sql.VarChar, Area);
      request.input('ClientsAddress', sql.VarChar, ClientsAddress);
      request.input('ClientsContactNumber', sql.VarChar, ClientsContactNumber);
      request.input('ClientsDateOfBirth', sql.Date, ClientsDateOfBirth);
      request.input('ClientsFirstName', sql.VarChar, ClientsFirstName);
      request.input('ClientsLastName', sql.VarChar, ClientsLastName);
      request.input('ContactType', sql.VarChar, ContactType);
      request.input('FormData', sql.NVarChar, JSON.stringify(FormData));
      request.input('IsOnBehalfOf', sql.Bit, IsOnBehalfOf); 
      request.input('IsProcessed', sql.Bit, IsProcessed);
      request.input('Outcomes', sql.VarChar, Outcomes);
      request.input('Reason', sql.VarChar, Reason);
      request.input('ReportersAddress', sql.VarChar, ReportersAddress);
      request.input('ReportersContactNumber', sql.VarChar, ReportersContactNumber);
      request.input('ReportersName', sql.VarChar, ReportersName);
      request.input('ReportersRelationship', sql.VarChar, ReportersRelationship);

      const result = await request.query(`
          INSERT INTO contactCaresReferrals (Area, ClientsAddress, ClientsDateOfBirth, ClientsFirstName, ClientsLastName, ContactType, FormData, IsOnBehalfOf, IsProcessed, Outcomes, Reason, ReportersAddress, ReportersName, ReportersRelationship)
          OUTPUT INSERTED.*
          VALUES (@Area, @ClientsAddress, @ClientsDateOfBirth, @ClientsFirstName, @ClientsLastName, @ContactType, @FormData, @IsOnBehalfOf, @IsProcessed, @Outcomes, @Reason, @ReportersAddress, @ReportersName, @ReportersRelationship);
      `);

      const newResource = result.recordset;

      logger.info(`Created referral ${newResource.id}`);

      res
        .status(201)
        .location(`/api/referrals/${newResource.id}`)
        .json(newResource);
  } catch (err) {
      logger.error(`ReferralCtrl:: addReferral(): Error ${err}`);
      res.status(500).json({ message: err.message });
  }
}