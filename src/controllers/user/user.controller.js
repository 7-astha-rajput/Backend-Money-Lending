import User from "../../models/user.model.js";
import logger from "../../config/winston.js";

const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        return res.json(user);
    } catch (error) {
        logger.error(error.message, error.stack);
        return res.status(500).json({ message: error.message });
    }
}

const updateUser = async (req, res) => {
    try {
        const { name, email, phone, DOB, monthly_salary } = req.body;


        const user = await User.findOneAndUpdate(
            { _id: req.user.id },
            {
                $set: {
                    name: name ,
                    email: email ,
                    phone: phone ,
                    DOB: DOB ,
                    monthly_salary: monthly_salary 
                }
            },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json(user);
    } catch (error) {
        logger.error(error.message, error.stack);
        return res.status(500).json({ message: error.message });
    }
};



const borrowMoney = async (req, res) => {
    const { amount, tenure } = req.body;

    try {
        let user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.purchase_power += amount;

        const interestRate = 0.08;
        const monthlyRepayment = (amount * (1 + interestRate)) / tenure;

        await user.save();

        res.json({
            purchasePower: user.purchase_power,
            monthlyRepayment
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

export {
    getUser,
    updateUser,
    borrowMoney,
}