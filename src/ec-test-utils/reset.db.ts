import sequelize from "../ec-models";

const resetDb = async () => {
  return Promise.all(
    Object.keys(sequelize.models).map((key) => {
      if (["sequelize", "Sequelize"].includes(key)) return null;
      return sequelize.models[key].destroy({ where: {}, force: true });
    })
  );
};

export default resetDb;
