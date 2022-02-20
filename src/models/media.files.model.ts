import { Optional, Sequelize } from "sequelize";
import { Model, DataTypes } from "sequelize";
import { ModelRegistry } from ".";
import { FileType } from "../enum/media.enum";
import { ModelStatic, SequelizeAttributes } from "../typing/sequelize.typing";

export interface MediaFilesAttributes {
  file_id: string;
  folder_id: string | null;
  name: string;
  desc: string;
  icon: string;
  uploaded_by: string;
  url: string;
  size_in_mb: number;
  ext: string;
  file_type: FileType;
}

interface MediaFilesCreationAttributes extends Optional<MediaFilesAttributes, "folder_id" | "desc" | "icon"> {}

export interface MediaFilesInstance
  extends Model<MediaFilesAttributes, MediaFilesCreationAttributes>,
    MediaFilesAttributes {
  setDataValue: (key: any, val: any) => void;
}

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
  icon: DataTypes.STRING,
  uploaded_by: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: "Creator of the folder",
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  size_in_mb: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ext: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  file_type: {
    type: DataTypes.ENUM,
    values: Object.values(FileType),
    defaultValue: FileType.IMAGE,
  },
};

// --> Factory....
export function MediaFilesFactory(sequelize: Sequelize) {
  const MediaFiles = <ModelStatic<MediaFilesInstance>>sequelize.define("MediaFiles", MediaFilesModelAttributes as any, {
    timestamps: true,
    tableName: "MediaFiles",
    freezeTableName: true,
    paranoid: true,
  });

  MediaFiles.associate = function (models: ModelRegistry) {
    const { MediaFiles } = models;

    MediaFiles.belongsTo(models.MediaFolder, {
      as: "folder",
      foreignKey: "folder_id",
      targetKey: "folder_id",
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
