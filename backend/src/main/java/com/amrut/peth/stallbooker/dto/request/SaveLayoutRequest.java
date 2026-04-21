package com.amrut.peth.stallbooker.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class SaveLayoutRequest {
	@NotNull
    private String mode; // "GRID" or "IMAGE"

    private String layoutImageUrl;

    private int primeCount;
    private int superCount;
    private int generalCount;
    private double primePrice;
    private double superPrice;
    private double generalPrice;

    private List<MarkerDto> markers;

    @Data
    public static class MarkerDto {
        public Long getId() {
			return id;
		}
		public void setId(Long id) {
			this.id = id;
		}
		public String getNumber() {
			return number;
		}
		public void setNumber(String number) {
			this.number = number;
		}
		public String getCategory() {
			return category;
		}
		public void setCategory(String category) {
			this.category = category;
		}
		public double getPrice() {
			return price;
		}
		public void setPrice(double price) {
			this.price = price;
		}
		public String getStatus() {
			return status;
		}
		public void setStatus(String status) {
			this.status = status;
		}
		public double getX() {
			return x;
		}
		public void setX(double x) {
			this.x = x;
		}
		public double getY() {
			return y;
		}
		public void setY(double y) {
			this.y = y;
		}
		public double getW() {
			return w;
		}
		public void setW(double w) {
			this.w = w;
		}
		public double getH() {
			return h;
		}
		public void setH(double h) {
			this.h = h;
		}
		private Long id;
        private String number;
        private String category;
        private double price;
        private String status;
        private double x;
        private double y;
        private double w;
        private double h;
        
    }

    public String getMode() {
		return mode;
	}

	public void setMode(String mode) {
		this.mode = mode;
	}

	public String getLayoutImageUrl() {
		return layoutImageUrl;
	}

	public void setLayoutImageUrl(String layoutImageUrl) {
		this.layoutImageUrl = layoutImageUrl;
	}

	public int getPrimeCount() {
		return primeCount;
	}

	public void setPrimeCount(int primeCount) {
		this.primeCount = primeCount;
	}

	public int getSuperCount() {
		return superCount;
	}

	public void setSuperCount(int superCount) {
		this.superCount = superCount;
	}

	public int getGeneralCount() {
		return generalCount;
	}

	public void setGeneralCount(int generalCount) {
		this.generalCount = generalCount;
	}

	public double getPrimePrice() {
		return primePrice;
	}

	public void setPrimePrice(double primePrice) {
		this.primePrice = primePrice;
	}

	public double getSuperPrice() {
		return superPrice;
	}

	public void setSuperPrice(double superPrice) {
		this.superPrice = superPrice;
	}

	public double getGeneralPrice() {
		return generalPrice;
	}

	public void setGeneralPrice(double generalPrice) {
		this.generalPrice = generalPrice;
	}

	public List<MarkerDto> getMarkers() {
		return markers;
	}

	public void setMarkers(List<MarkerDto> markers) {
		this.markers = markers;
	}

	}
