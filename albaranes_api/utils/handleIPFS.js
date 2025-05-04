const axios = require('axios');
const FormData = require('form-data');

const handleIPFS = async (buffer, filename) => {
  const data = new FormData();
  data.append('file', buffer, filename);

  const res = await axios.post(
    'https://api.pinata.cloud/pinning/pinFileToIPFS',
    data,
    {
      headers: {
        ...data.getHeaders(),
        Authorization: `Bearer ${process.env.PINATA_JWT}`
      }
    }
  );

  return `${process.env.PINATA_GATEWAY_URL}/ipfs/${res.data.IpfsHash}`;
};

module.exports = { handleIPFS };
