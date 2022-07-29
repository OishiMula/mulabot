const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('webhook')
    .setDescription('testing'),

  async execute(interaction) {
    const dummyData = {
      "id": "5ffcaf65-7961-4377-9741-fa0c76176a4b",
      "webhook_id": "b592db93-ec26-4ecc-8800-8a14b3a2806f",
      "created": 1654811689,
      "api_version": 1,
      "type": "epoch",
      "payload": {
        "previous_epoch": {
          "epoch": 343,
          "start_time": 1654379091,
          "end_time": 1654811091,
          "first_block_time": 1654379116,
          "last_block_time": 1654811087,
          "block_count": 20994,
          "tx_count": 463239,
          "output": "106038169691018243",
          "fees": "162340782180",
          "active_stake": "24538091587045780"
        },
        "current_epoch": {
          "epoch": 344,
          "start_time": 1654811091,
          "end_time": 1655243091
        }
      }
    }

    const dummyHook = JSON.stringify(dummyData);
    const webhook = await interaction.client.fetchWebhook('1002434612611518546')
    await webhook.send(dummyHook);

    //await interaction.editReply('Hooray!');
    return 'Done';
  }
}