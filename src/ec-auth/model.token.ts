import { Model, Optional, DataTypes, Sequelize, BuildOptions } from "sequelize";
import { ModelRegistry } from "../ec-models";
import { TokenTypes } from "./types";
import { ModelStatic } from "../ec-models/types";

export interface TokenAttributes {
  id: number;
  user_id: string;
  token: string;
  type: TokenTypes;
  expires: Date;
}

interface TokenCreationAttributes extends Optional<TokenAttributes, "id"> {}

interface TokenInstance extends Model<TokenAttributes, TokenCreationAttributes>, TokenAttributes {}

export function TokenFactory(sequelize: Sequelize) {
  const Token = <ModelStatic<TokenInstance>>sequelize.define(
    "Token",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: "Token Id",
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        values: Object.values(TokenTypes),
        defaultValue: TokenTypes.REFRESH,
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      expires: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      tableName: "Token",
      // freezeTableName:true,
    }
  );

  Token.associate = function (models: ModelRegistry) {
    const { Token } = models;

    Token.belongsTo(models.User, {
      as: "user",
      foreignKey: "user_id",
      targetKey: "user_id",
    });
  };

  return Token;
}
