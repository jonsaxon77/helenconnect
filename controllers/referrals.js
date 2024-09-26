import sql from 'mssql'
import logger from '../logger.js';

export async function getReferrals(req, res) {
  try {
    const request = new sql.Request();
    request.input("isProcessed", sql.Int, req.params.isProcessed);

    const result = await request.query(
      "SELECT * FROM contactCaresReferrals WHERE IsProcessed = @isProcessed"
    );

    const response = {
      count: result.recordset.length,
      records: result.recordset,
    };

    res.status(200).json(response);
  } catch (err) {
    logger.error(`ReferralCtrl:: getReferrals(): Error ${err}`);
    res.status(500).json({message: err.message});
  }
}

export async function getReferral(req, res) {
  try {
    const request = new sql.Request();
    request.input("id", sql.Int, req.params.id);

    const result = await request.query(
      "SELECT * FROM contactCaresReferrals WHERE Id = @id"
    );
  } catch (err) {
    logger.error(`ReferralCtrl:: getReferrals(): Error ${err}`);
    res.status(500).json({message: err.message});
  }
}

export async function addReferral(req, res) {
  const {
    Area,
    ContactType,
    Outcomes,
    Reason,
    ReportersName,
    ReportersAddress,
    ReportersRelationship,
    ClientsFirstName,
    ClientsLastName,
    ClientsDateOfBirth,
    ClientsAddress,
    FormData,
    IsOnBehalfOf,
    IsProcessed,
  } = req.body;

  try {
    const result = await sql.query`
          INSERT INTO contactCaresReferrals (Area, ContactType, Outcomes, Reason,ReportersName, ReportersAddress, ReportersRelationship, ClientsFirstName, ClientsLastName, ClientsDateOfBirth, ClientsAddress, FormData, IsOnBehalfOf, IsProcessed) 
          VALUES(${Area}, ${ContactType}, ${Outcomes}, ${Reason},${ReportersName}, ${ReportersAddress}, ${ReportersRelationship}, ${ClientsFirstName}, ${ClientsLastName}, ${ClientsDateOfBirth}, ${ClientsAddress}, ${JSON.stringify(
      FormData
    )}, ${IsOnBehalfOf}, ${IsProcessed});
          SELECT SCOPE_IDENTITY() AS referralId; 
      `;

    const referralId = result.recordset[0].referralId;

    const newResource = {
      id: referralId,
      Area,
      ContactType,
      Outcomes,
      Reason,
      ReportersName,
      ReportersAddress,
      ReportersRelationship,
      ClientsFirstName,
      ClientsLastName,
      ClientsDateOfBirth,
      ClientsAddress,
      FormData,
      IsOnBehalfOf,
      IsProcessed,
    };

    logger.info(`Created referral ${newResource.id}`);

    res
      .status(201)
      .location(`/api/v1/referrals/${newResource.id}`)
      .json(newResource);
  } catch (err) {
    logger.error(`ReferralCtrl:: addReferral(): Error ${err}`);
    res.status(500).json({message:err.message});
  }
}
