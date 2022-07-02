import { Optional, Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from "../ec-models";
import { ImageVariant } from "./types";
import { ModelStatic, SequelizeAttributes } from "../ec-models/types";

export interface MediaFilesAttributes {
  file_id: string;
  folder_id: string | null;
  name: string;
  desc: string;
  created_by: string;
  url: string;
  size: number;
  width: number;
  height: number;
  mime: string;
  key: string;
  bucket: string;
  variants: Record<string, ImageVariant>;
}

interface MediaFilesCreationAttributes
  extends Optional<MediaFilesAttributes, "folder_id" | "desc"> {}

export interface MediaFilesInstance
  extends Model<MediaFilesAttributes, MediaFilesCreationAttributes>,
    MediaFilesAttributes {}

//--> Model attributes
export const MediaFilesModelAttributes: SequelizeAttributes<MediaFilesAttributes> = {
  file_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    comment: "MediaFiles Id",
    allowNull: false,
    unique: true,
  },
  folder_id: DataTypes.STRING,
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  desc: DataTypes.STRING,
  created_by: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: "Creator of the file",
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  width: DataTypes.INTEGER,
  height: DataTypes.INTEGER,
  mime: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bucket: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  variants: {
    type: DataTypes.JSONB,
  },
};

// --> Factory....
export function MediaFilesFactory(sequelize: Sequelize) {
  const MediaFiles = <ModelStatic<MediaFilesInstance>>sequelize.define(
    "MediaFiles",
    MediaFilesModelAttributes,
    {
      timestamps: true,
      tableName: "MediaFiles",
      freezeTableName: true,
      paranoid: true,
      indexes: [{ fields: ["folder_id"] }],
    }
  );

  MediaFiles.associate = function (models: ModelRegistry) {
    const { MediaFiles } = models;

    MediaFiles.belongsTo(models.MediaFolder, {
      as: "folder",
      foreignKey: "folder_id",
      targetKey: "folder_id",
    });

    MediaFiles.belongsTo(models.User, {
      as: "user",
      foreignKey: "uploaded_by",
      targetKey: "user_id",
    });
  };

  MediaFiles.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.createdAt;
    delete values.updatedAt;
    return values;
  };
  return MediaFiles;
}
