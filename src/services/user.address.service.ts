import { Request } from "express";
import { NotFoundError } from "../apiresponse/not.found.error";
import { UnauthorizedError } from "../apiresponse/unauthorized.error";
import { UserAddress } from "../models";
import { UserAddressAttributes, UserAddressInstance } from "../models/user.address.model";
import { createModel } from "../utils/random.string";

const create = async (req: Request) => {
  const body: UserAddressAttributes = req.body;
  const { user_id } = req.user!;

  body.user_id = user_id;
  const address = await createModel<UserAddressInstance>(UserAddress, body, "address_id");
  return address;
};
const update = async (req: Request) => {
  const { address_id } = req.params;
  const body: UserAddressAttributes = req.body;
  const { user_id } = req.user!;

  const address = await findById(address_id);
  if (address.user_id != user_id) {
    throw new UnauthorizedError("Cannot edit another person's address");
  }

  //Reset others default to false if this set to default
  if (body.is_default && !address.is_default) {
    await UserAddress.update({ is_default: false }, { where: { user_id } });
  }

  Object.assign(address, body);
  await address.save();
  return address.reload();
};

const findById = async (address_id: string) => {
  const report = await UserAddress.findOne({ where: { address_id } });
  if (!report) {
    throw new NotFoundError("Address not found");
  }
  return report;
};

const findAllByUserId = async (req: Request) => {
  const { user_id } = req.user!;

  const addresses = await UserAddress.findAll({
    where: { user_id },
    order: [["id", "DESC"]],
  });
  return addresses;
};

export default {
  create,
  update,
  findById,
  findAllByUserId,
};
