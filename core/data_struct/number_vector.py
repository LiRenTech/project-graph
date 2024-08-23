import math


class NumberVector:

    def __init__(self, x: float, y: float):
        self.x: float = x
        self.y: float = y

    @staticmethod
    def zero():
        return NumberVector(0, 0)

    @staticmethod
    def from_two_points(p1: "NumberVector", p2: "NumberVector"):
        return NumberVector(p2.x - p1.x, p2.y - p1.y)

    def rotate(self, degrees: float):
        radians = math.radians(degrees)
        cos_theta = math.cos(radians)
        sin_theta = math.sin(radians)
        x = self.x * cos_theta - self.y * sin_theta
        y = self.x * sin_theta + self.y * cos_theta
        return NumberVector(x, y)

    def is_zero(self):
        return self.x == 0 and self.y == 0

    def integer(self):
        return NumberVector(round(self.x), round(self.y))

    def normalize(self):
        """将此向量转化为单位向量"""
        return self / self.__len__()

    def limit_x(self, min_value: float, max_value: float):
        return NumberVector(max(min(self.x, max_value), min_value), self.y)

    def limit_y(self, min_value: float, max_value: float):  # 限制y轴的范围
        return NumberVector(self.x, max(min(self.y, max_value), min_value))

    def clone(self):
        return NumberVector(self.x, self.y)

    def __str__(self):
        return f"({self.x}, {self.y})"

    def __repr__(self):
        return f"NumberVector({self.x}, {self.y})"

    def __add__(self, other):
        return NumberVector(self.x + other.x, self.y + other.y)

    def __sub__(self, other):
        if isinstance(other, NumberVector):
            return NumberVector(self.x - other.x, self.y - other.y)
        else:
            return NumberVector(self.x - other, self.y - other)

    def __mul__(self, other) -> "NumberVector":
        if isinstance(other, NumberVector):
            return NumberVector(self.x * other.x, self.y * other.y)
        else:
            return NumberVector(self.x * other, self.y * other)

    def __truediv__(self, other):
        if isinstance(other, NumberVector):
            return NumberVector(self.x / other.x, self.y / other.y)
        else:
            return NumberVector(self.x / other, self.y / other)

    def __eq__(self, other):
        if isinstance(other, NumberVector):
            return self.x == other.x and self.y == other.y
        else:
            return False

    def __ne__(self, other):
        if isinstance(other, NumberVector):
            return self.x != other.x or self.y != other.y
        else:
            return True

    def __neg__(self):
        return NumberVector(-self.x, -self.y)

    def __pos__(self):
        return NumberVector(+self.x, +self.y)

    def __abs__(self):
        return NumberVector(abs(self.x), abs(self.y))

    def __round__(self, n=None):
        return NumberVector(round(self.x, n), round(self.y, n))

    def __floor__(self):
        return NumberVector(math.floor(self.x), math.floor(self.y))

    def __ceil__(self):
        return NumberVector(math.ceil(self.x), math.ceil(self.y))

    def __trunc__(self):
        return NumberVector(math.trunc(self.x), math.trunc(self.y))

    def __iadd__(self, other):
        if isinstance(other, NumberVector):
            self.x += other.x
            self.y += other.y
        else:
            self.x += other
            self.y += other
        return self

    def __isub__(self, other):
        if isinstance(other, NumberVector):
            self.x -= other.x
            self.y -= other.y
        else:
            self.x -= other
            self.y -= other
        return self

    def __imul__(self, other):
        if isinstance(other, NumberVector):
            self.x *= other.x
            self.y *= other.y
        else:
            self.x *= other
            self.y *= other
        return self

    def __len__(self) -> float:
        """返回向量的模长"""
        return math.sqrt(self.x**2 + self.y**2)

    def magnitude(self) -> float:
        """返回向量的模长"""
        return math.sqrt(self.x**2 + self.y**2)

    def cross(self, other: "NumberVector") -> float:
        """计算两个向量的叉积"""
        return self.x * other.y - self.y * other.x
