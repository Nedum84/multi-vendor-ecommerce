import { Model, Optional, DataTypes, Sequelize, BuildOptions } from "sequelize";
import { TokenTypes } from "../enum/token.enum";
import { ModelStatic } from "../typing/sequelize.typing";

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
  return Token;
}
